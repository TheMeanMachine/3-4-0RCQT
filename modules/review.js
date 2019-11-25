'use strict'

const sqlite = require('sqlite-async')
//Custom modules
const valid = require('./validator')
const Comments = require('./comment')
const Users = require('./user')
const Image = require('./image')

module.exports = class Review {
	constructor(dbName) {
		this.validator = new valid()

		return (async() => {

			this.dbName = dbName || ':memory:'
			this.db = await sqlite.open(this.dbName)
			this.users = await new Users(this.dbName)
			this.image = await new Image(this.dbName)
			this.comments = await new Comments(this.dbName)
			const sql =
			[`CREATE TABLE IF NOT EXISTS reviewScreenshot(ID INTEGER PRIMARY KEY AUTOINCREMENT,
				reviewID INTEGER,picture TEXT, FOREIGN KEY (reviewID) REFERENCES review(ID));`,`
			CREATE TABLE IF NOT EXISTS review(ID INTEGER PRIMARY KEY AUTOINCREMENT,
				gameID INTEGER,userID INTEGER,fullText TEXT,rating INTEGER,flag INTEGER,
            	FOREIGN KEY (gameID) REFERENCES game(ID),FOREIGN KEY (userID) REFERENCES user(ID));`]

			for(let i = 0; i < sql.length; i++) {
				await this.db.run(sql[i])
			}

			return this
		})()
	}

	/**
     * Function to check rating logic
     *
     * @name checkRating
     * @param rating the rating to check
	 * @throws If rating is not between 1-5
     * @returns true if rating is valid
     */
	checkRating(rating) {


		this.validator.checkID(rating, 'rating')

		const maxRating = 5
		const greater = rating > 0
		const lesser = rating <= maxRating
		if(!greater || !lesser) throw new Error('Rating must be 1-5')


		return true
	}

	/**
     * Function to delete reviews by ID
     *
     * @name deleteReviewByID
     * @param reviewID The reviewID to act on
	 * @throws If ID is not supplied
     * @returns true if successful
     */
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

	// eslint-disable-next-line max-lines-per-function
	async searchReview(gameID, userID, toSearch, admin) {
		this.validator.checkID(gameID, 'gameID')
		this.validator.checkID(userID, 'userID')
		this.validator.checkStringExists(toSearch, 'query')

		const sql = `
        SELECT * FROM review
		WHERE (fullText LIKE "%${toSearch}%")
		AND (gameID = ${gameID}) AND (userID != ${userID});`
		const data = await this.db.all(sql)
		const amtReviews = Object.keys(data).length
		const result = {reviews: [], count: amtReviews, reviewIDs: []}
		for(let i = 0; i < amtReviews; i++) {
			result.reviewIDs.push(data[i].ID)
			data[i].pictures = (await this.image.getPicturesByReviewID(data[i].ID)).pictures
			if(admin || data[i].flag === 1) result.reviews.push(data[i])//Remove unchecked reviews, unless admin
		}
		result.userReview = (await this.getReviewsByGameID(gameID,admin, userID)).userReview

		return result
	}

	/**
     * Function to publish or unpublish a review
     *
     * @name publishReview
     * @param reviewID The reviewID to act on
	 * @param make Boolean - true if want to publish, false if not
	 * @throws If ID is not supplied
     * @returns true if update successful
     */
	async publishReview(reviewID, make) {
		this.validator.checkID(reviewID)

		let publish = 0
		if(make) publish = 1
		const sql = `
		UPDATE review 
		SET flag = ${publish}
		WHERE ID = ${reviewID};`
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

		const fullText = data.fullText
		const rating = data.rating

		this.validator.checkID(userID, 'userID')
		this.validator.checkID(gameID, 'gameID')
		this.checkRating(rating)//Check input is sensible
		if(!this.validator.checkMultipleWordsOnlyAlphaNumberic(fullText)) throw new Error('Must supply fulltext')
		const sql = `SELECT COUNT(ID) as records FROM review
		WHERE userID=${userID} AND gameID=${gameID};`//Make sure user has a review for this game
		const result = await this.db.get(sql)
		if(result.records === 0) throw new Error('Review not found')


		const updateSql = `UPDATE review SET fullText = "${fullText}",
			rating = ${rating},
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
		if(!this.validator.checkMultipleWordsOnlyAlphaNumberic(fullText)) throw new Error('Must supply fulltext')
		this.validator.checkID(gameID, 'gameID')


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
	 * @throws If userID is not supplied
     * @returns array of objects if successful
     *
     */
	async getReviewsByGameID(gameID, admin, userID) {

		this.validator.checkID(gameID, 'gameID')
		this.validator.checkID(userID, 'userID')

		const sql = `SELECT * FROM review WHERE gameID = ${gameID};`

		const data = await this.db.all(sql)

		const result = {reviews: [], count: Object.keys(data).length, reviewIDs: []}
		for(let i = 0; i < Object.keys(data).length; i++) {
			result.reviewIDs.push(data[i].ID)
			data[i].comments = (await this.comments.getCommentsByReviewID(data[i].ID)).comments
			data[i].pictures = (await this.image.getPicturesByReviewID(data[i].ID)).pictures
			if(userID === data[i].userID) {
				result.userReview = data[i]
				continue
			}

			if(admin || data[i].flag === 1) result.reviews.push(data[i])//Remove unchecked reviews, unless admin

		}

		return result

	}

	/**
     * Function to get all of a game's Average Rating
     *
     * @name getAverageRating
     * @param gameID The gameID to average based on
	 * @throws If gameID is not supplied
     * @returns average of game's reviews
     *
     */
	async getAverageRating(gameID) {

		this.validator.checkID(gameID, 'gameID')

		const sql = `
		SELECT AVG(rating) as average FROM review
		WHERE gameID = ${gameID}`
		const data = await this.db.get(sql)

		return data.average

	}
}
