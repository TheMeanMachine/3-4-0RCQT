

'use strict'

const sqlite = require('sqlite-async')
//Custom modules
const valid = require('./validator')
const Games = require('./game')
const Users = require('./user')

module.exports = class Review {
	constructor(dbName) {
		this.validator = new valid()

		return (async() => {

			this.dbName = dbName || ':memory:'
			this.db = await sqlite.open(this.dbName)
			this.games = await new Games(this.dbName)
			this.users = await new Users(this.dbName)
			const sql =
			[`CREATE TABLE IF NOT EXISTS reviewScreenshot(ID INTEGER PRIMARY KEY AUTOINCREMENT,
				reviewID INTEGER,picture TEXT,
                FOREIGN KEY (reviewID) REFERENCES review(ID));`,`
			CREATE TABLE IF NOT EXISTS review(ID INTEGER PRIMARY KEY AUTOINCREMENT,
				gameID INTEGER,userID INTEGER,fullText TEXT,rating INTEGER,flag INTEGER,
            	FOREIGN KEY (gameID) REFERENCES game(ID),
				FOREIGN KEY (userID) REFERENCES user(ID));`]

			for(let i = 0; i < sql.length; i++) {
				await this.db.run(sql[i])
			}

			return this
		})()
	}

	/**
     * Function to check fields associated with reviews
     *
     * @name checkReviewFields
     * @param fullText The body of text for the review
	 * @param rating The rating of the review
	 * @throws If fulltext doesn't match requirements
	 * @throws If rating is less than 1 or greater than 5
	 * @throws If all params are null
     * @returns true if successful
     *
     */
	checkRating(rating) {

		if(rating !== null) {

			this.validator.checkID(rating, 'rating')

			const maxRating = 5
			const greater = rating > 0
			const lesser = rating <= maxRating
			if(!greater || !lesser) throw new Error('Rating must be 1-5')

		}

		return true
	}

	async deleteReviewByID(reviewID) {

		this.validator.checkID(reviewID, 'reviewID')

		const sql = [`
			DELETE FROM reviewScreenshot
			WHERE reviewID = ${reviewID};
			`,`
			DELETE FROM review
			WHERE ID = ${reviewID};
			`
		]

		for(let i = 0; i < sql.length; i++) {
			await this.db.run(sql[i])
		}

		return true

	}

	async publishReview(reviewID, boolean) {
		this.validator.checkID(reviewID)

		let publish = 0
		if(boolean) publish = 1
		const sql = `
		UPDATE review 
		SET flag = ${publish}
		WHERE ID = ${reviewID};`
		console.log(sql)
		await this.db.run(sql)

		return true
	}

	/**
     * Function to update a review
     *
     * @name updateReview
     * @param userID The userID of the review
	 * @param gameID The gameID of the review
	 * @param data Object which contains fullText & rating for example: {fulltext: 'sometext', rating: 4}
	 * @throws If userID is not supplied
	 * @throws If gameID is not supplied
	 * @throws If review not found
     * @returns true if successful
     *
     */
	async updateReview(userID, gameID, data) {

		const fullText = data.fullText || null
		const rating = data.rating || null

		this.validator.checkID(userID, 'userID')
		this.validator.checkID(gameID, 'gameID')

		const sql = `SELECT COUNT(ID) as records FROM review
		WHERE userID=${userID} AND gameID=${gameID};`//Make sure user has a review for this game
		const result = await this.db.get(sql)
		if(result.records === 0) throw new Error('Review not found')


		this.checkRating(rating)//Check input is sensible
		if(!this.validator.checkMultipleWordsOnlyAlphaNumberic(fullText)) throw new Error('Must supply fullText')

		const updateSql = `UPDATE review SET fullText = "${fullText}",
			rating = ${rating}
			flag = 0
			WHERE userID = ${userID}
			AND gameID = ${gameID};
			`

		await this.db.run(updateSql)

		return true

	}

	/**
     * Function to add a review
     *
     * @name addReview
     * @param userID The userID of the review
	 * @param gameID The gameID of the review
	 * @param data Object which contains fullText & rating for example: {fulltext: 'sometext', rating: 4}
	 * @throws If userID is not supplied
	 * @throws If gameID is not supplied
     * @returns id of new review if successful
     *
     */
	async addReview(gameID, data, userID) {
		const fullText = data.fullText || ''
		const rating = data.rating

		this.checkRating(rating)//Check input is sensible
		if(!this.validator.checkMultipleWordsOnlyAlphaNumberic(fullText)) throw new Error('Must supply fullText')
		this.validator.checkID(gameID, 'gameID')

		await this.games.getGameByID(gameID)//Checks if game exists

		this.validator.checkID(userID, 'userID')

		const sql = `INSERT INTO review (gameID,userID,fullText,rating,flag) VALUES (
				${gameID},${userID},"${fullText}",${rating},0);`

		const result = await this.db.run(sql)

		return result.lastID

	}
	/**
     * Function to get all of a game's reviews
     *
     * @name getReviewsByGameID
     * @param gameID The gameID to find the reviews based on
	 * @throws If gameID is not supplied
	 * @throws If game not found
     * @returns array of objects if successful
     *
     */
	async getReviewsByGameID(gameID) {
		try{
			this.validator.checkID(gameID, 'gameID')

			await this.games.getGameByID(gameID)//Checks if game exists

			const sql = `
            SELECT * FROM review
            WHERE gameID = ${gameID};`

			const data = await this.db.all(sql)
			const amtReviews = Object.keys(data).length
			const result = {reviews: [], count: amtReviews}
			for(let i = 0; i < amtReviews; i++) {
				result.reviews.push(data[i])
			}
			if(amtReviews === 0) {
				throw new Error('No reviews found')
			}
			return result
		}catch(e) {
			throw e
		}
	}

	async getAverageRating(gameID) {
		try{
			if(gameID === null || isNaN(gameID)) {
				throw new Error('Must supply gameID')
			}

			await this.games.getGameByID(gameID)//Checks if game exists

			const sql = `
			SELECT AVG(rating) as average FROM review
			WHERE gameID = ${gameID}`
			const data = await this.db.get(sql)

			return data.average
		}catch(e) {
			throw e
		}
	}
}
