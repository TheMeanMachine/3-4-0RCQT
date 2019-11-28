
'use strict'

const mime = require('mime-types')
const sqlite = require('sqlite-async')
const fs = require('fs-extra')

const sharp = require('sharp')
//Custom modules
const valid = require('./validator')

module.exports = class image {
	constructor(dbName) {
		this.validator = new valid()

		return (async() => {
			this.dbName = dbName || ':memory:'

			this.db = await sqlite.open(this.dbName)

			const sql =[`CREATE TABLE IF NOT EXISTS gamePhoto(ID INTEGER PRIMARY KEY AUTOINCREMENT,
				gameID INTEGER,picture TEXT,
            	FOREIGN KEY (gameID) REFERENCES game(ID));
            `,`
            CREATE TABLE IF NOT EXISTS reviewScreenshot(ID INTEGER PRIMARY KEY AUTOINCREMENT,
                reviewID INTEGER,picture TEXT,
                FOREIGN KEY (reviewID) REFERENCES review(ID)
            );`]

			for(let i = 0; i < sql.length; i++) await this.db.run(sql[i])

			return this
		})()

	}
	/**
     * Function to upload a picture and associate it to a game
     *
     * @name uploadPictureToGame
     * @param path path is the input path
     * @param mimeType is the type of the picture
     * @param gameID gameID refers to the ID in the database
     * @throws error if params are not given
     * @returns true if no problems
     *
     */
	async uploadPictureToGame(path, mimeType, gameID) {

		this.validator.checkID(gameID, 'gameID')

		this.validator.checkStringExists(path, 'path')
		this.validator.checkStringExists(mimeType, 'type')
		if(!mimeType.match(/.(jpg|jpeg|png|gif)$/i)) throw new Error('Not an image')
		const extension = mime.extension(mimeType)

		let sql = `SELECT COUNT(id) as records FROM gamePhoto WHERE gameID="${gameID}";`
		const sqlReturn = await this.db.get(sql)//Set to the amount of pictures saved

		const picPath = `game/${gameID}/picture_${sqlReturn.records}.${extension}`
		const resizeAmt = 300
		await fs.copy(path, `public/${ picPath}`)//Failsafe
		await sharp(path)
			.resize(resizeAmt, resizeAmt)
	  		.toFile(`public/${ picPath}`)
			.catch((err) => {})

		sql = `INSERT INTO gamePhoto (gameID, picture) VALUES(
            ${gameID},"${picPath}")`
		await this.db.run(sql)

		return true

	}
	/**
     * Function to upload a picture and associate it to a review
     *
     * @name uploadPictureToReview
     * @param path path is the input path
     * @param mimeType is the type of the picture
     * @param reviewID reviewID refers to the ID in the database
     * @throws error if params are not given
     * @returns true if no problems
     *
     */
	async uploadPictureToReview(path, mimeType, reviewID) {

		this.validator.checkID(reviewID, 'reviewID')

		this.validator.checkStringExists(path, 'path')
		this.validator.checkStringExists(mimeType, 'type')
		if(!mimeType.match(/.(jpg|jpeg|png|gif)$/i)) throw new Error('Not an image')
		const extension = mime.extension(mimeType)

		let sql = `SELECT COUNT(id) as records FROM reviewScreenshot WHERE reviewID="${reviewID}";`
		const sqlReturn = await this.db.get(sql)//Set to the amount of pictures saved
		const picPath = `review/${reviewID}/picture_${sqlReturn.records}.${extension}`
		const resizeAmt = 300
		await fs.copy(path, `public/${ picPath}`)//Failsafe
		await sharp(path)
  			  .resize(resizeAmt, resizeAmt)
			  .toFile(`public/${picPath}`)
			  .catch((err) => {})

		sql = `INSERT INTO reviewScreenshot (reviewID, picture) VALUES(
		${reviewID},"${picPath}")`
		await this.db.run(sql)
		return true

	}

	/**
     * Function to get pictures associated with a game
     *
     * @name getPicturesByGameID
     * @param gameID gameID refers to the ID in the database
     * @throws error if gameID is not supplied
     * @returns object containing picture urls
     */
	async getPicturesByGameID(gameID) {
		try{
			this.validator.checkID(gameID, 'gameID')

			const sql = `
            SELECT * FROM gamePhoto
            WHERE gameID = ${gameID};
            `
			const data = await this.db.all(sql)
			const result = { pictures: [] }
			for(let i = 0; i < Object.keys(data).length; i++) {
				result.pictures.push(data[i].picture)
			}
			return result

		}catch(e) {
			throw e
		}
	}
	/**
     * Function to get pictures associated with a game
     *
     * @name getPicturesByReviewID
     * @param reviewID reviewID refers to the ID in the database
     * @throws error if gameID is not supplied
     * @returns object containing picture urls
     */
	async getPicturesByReviewID(reviewID) {
		try{
			this.validator.checkID(reviewID, 'reviewID')

			const sql = `
            SELECT * FROM reviewScreenshot
            WHERE reviewID = ${reviewID};
            `
			const data = await this.db.all(sql)
			const result = { pictures: [] }
			for(let i = 0; i < Object.keys(data).length; i++) {
				result.pictures.push(data[i].picture)
			}
			return result

		}catch(e) {
			throw e
		}
	}

}
