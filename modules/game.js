
'use strict'

const mime = require('mime-types')
const sqlite = require('sqlite-async')
const fs = require('fs-extra')
//const sharp = require('sharp')
//Custom modules
const valid = require('./validator')
const Publishers = require('./publisher')


module.exports = class Game {
	constructor(dbName) {
		this.validator = new valid()

		return (async() => {
			this.dbName = dbName || ':memory:'
			this.publisher = await new Publishers(this.dbName)
			this.db = await sqlite.open(this.dbName)

			const sql =[`CREATE TABLE IF NOT EXISTS game(ID INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT,summary TEXT,desc TEXT);
			`,`CREATE TABLE IF NOT EXISTS gamePhoto(ID INTEGER PRIMARY KEY AUTOINCREMENT,gameID INTEGER,picture TEXT,
            	FOREIGN KEY (gameID) REFERENCES game(ID));
            `,`CREATE TABLE IF NOT EXISTS game_category(ID INTEGER PRIMARY KEY AUTOINCREMENT,
				gameID INTEGER,categoryID INTEGER,
                FOREIGN KEY (gameID) REFERENCES game(ID),FOREIGN KEY (categoryID) REFERENCES category(ID));
			`,`CREATE TABLE IF NOT EXISTS game_publisher(ID INTEGER PRIMARY KEY AUTOINCREMENT,
                gameID INTEGER,publisherID INTEGER,
        		FOREIGN KEY (gameID) REFERENCES game(ID),FOREIGN KEY (publisherID) REFERENCES publisher(ID));`]

			for(let i = 0; i < sql.length; i++) await this.db.run(sql[i])

			return this
		})()

	}


	/**
     * Function to associate a publisher to a game
     *
     * @name associateToPublisher
     * @param gameID gameID refers to the ID in the database
     * @param publisherID publisherID refers to the publisher being associated to the game
     * @throws if params not supplied
     * @returns true if successful
     */
	async associateToPublisher(gameID, publisherID) {
		try{
			this.validator.checkID(gameID, 'gameID')
			this.validator.checkID(publisherID, 'publisherID')

			await this.getGameByID(gameID)
			await this.publisher.getPublisherByID(publisherID)

			const sql = `INSERT INTO game_publisher (gameID, publisherID)
            VALUES(
                ${gameID},
                ${publisherID}
            );`
			await this.db.run(sql)
			return true
		}catch(e) {
			throw e
		}
	}
	/**
     * Function to get publishers associated to a game
     *
     * @name getPublishers
     * @param gameID gameID refers to the ID in the database
     * @throws if gameID not supplied
     * @returns object containing publishers of game
     */
	async getPublishers(gameID) {
		try {
			if(gameID === null || isNaN(gameID)) {
				throw new Error('Must supply gameID')
			}
			await this.getGameByID(gameID)//Make sure game exists
			const sql = `SELECT * FROM game_publisher 
            WHERE gameID = ${gameID};`

			const data = await this.db.all(sql)
			const result = { publishers: [] }
			for(let i = 0; i < Object.keys(data).length; i++) {
				result.publishers.push(data[i].ID)
			}

			return result
		} catch(e) {
			throw e
		}
	}

	/**
     * Function to upload a picture and associate it to a game
     *
     * @name uploadPicture
     * @param path path is the input path
     * @param mimeType is the type of the picture
     * @param gameID gameID refers to the ID in the database
     * @throws error if params are not given
     * @returns true if no problems
     *
     */
	async uploadPicture(path, mimeType, gameID) {
		try{
			this.validator.checkID(gameID, 'gameID')

			this.validator.checkStringExists(path, 'path')
			this.validator.checkStringExists(mimeType, 'type')

			const extension = mime.extension(mimeType)

			await this.getGameByID(gameID)

			let sql = `SELECT COUNT(id) as records FROM gamePhoto WHERE gameID="${gameID}";`
			const data = await this.db.get(sql)//Set to the amount of pictures saved

			const picPath = `game/${gameID}/picture_${data.records}.${extension}`

			await fs.copy(path, `public/${ picPath}`)

			sql = `INSERT INTO gamePhoto (gameID, picture) VALUES(
                ${gameID},"${picPath}")`
			await this.db.run(sql)

			return true

		}catch(e) {
			throw e
		}
	}

	/**
     * Function to get pictures associated with a game
     *
     * @name getPictures
     * @param gameID gameID refers to the ID in the database
     * @throws error if gameID is not supplied
     * @returns object containing picture urls
     */
	async getPictures(gameID) {
		try{
			if(gameID === null || isNaN(gameID)) {
				throw new Error('Must supply gameID')
			}

			await this.getGameByID(gameID)

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
     * Function to add a new game
     *
     * @name addNewGame
     * @param title The title of the new game
     * @param summary The summary of the new game
     * @desc The description of the new game
     * @throws error if game already exists
     *
     * @returns true if no problems
     */
	async addNewGame(title, summary, desc) {
		try{

			this.checkGameFields(title, summary, desc)


			let sql = `SELECT COUNT(id) as records FROM game WHERE title="${title}";`
			const data = await this.db.get(sql)
			if(data.records !== 0) {
				throw new Error(`Game "${title}" already exists`)
			}

			sql = `INSERT INTO game (title, summary, desc)
            VALUES(
                "${title}",
                "${summary}",
                "${desc}"
            )`
			await this.db.run(sql)
			return true
		}catch(err) {
			throw err
		}
	}
	/**
     * Function to do validation checks on title, summary and description
     *
     * @name checkGameFields
     * @param title The title to check
     * @param summary Summary to check
     * @param desc Description to check
     * @throws error if any params do not suit checks
     * @returns true if all fields are either null or have no problems
     */
	checkGameFields(title, summary, desc) {

		const checkTitle = this.validator.checkMultipleWordsOnlyAlphaNumberic(title)
		if(!checkTitle) {
			throw new Error('Must supply title')
		}


		const checkSummary = this.validator.checkMultipleWordsOnlyAlphaNumberic(summary)
		if(!checkSummary) {
			throw new Error('Must supply summary')
		}


		const checkDesc = this.validator.checkMultipleWordsOnlyAlphaNumberic(desc)
		if(!checkDesc) {
			throw new Error('Must supply description')
		}

		return true
	}
	/**
     * Function to get game information based on ID
     *
     * @name getGameByID
     * @param ID the gameID to get game information from
     * @returns object containing game information
     */
	async getGameByID(ID) {
		try {
			this.validator.checkID(ID, 'ID')
			let sql = `SELECT count(ID) AS count FROM game WHERE ID = ${ID};`
			let records = await this.db.get(sql)
			if(records.count === 0) throw new Error('Game not found')

			sql = `SELECT * FROM game WHERE ID = ${ID};`

			records = await this.db.get(sql)

			const data = {
				ID: ID,
				title: records.title,
				summary: records.summary,
				desc: records.desc
			}

			return data
		} catch(err) {
			throw err
		}
	}
	/**
     * Function to get all games
     *
     * @name getGameByID
     * @returns object containing all games
     */
	async getGames() {
		const sql = `
        SELECT * FROM game;`
		const data = await this.db.all(sql)
		const result = { games: [] }
		for(let i = 0; i < Object.keys(data).length; i++) {
			result.games.push(data[i])
		}


		return result
	}

	/**
     * Function to get game information based on title
     *
     * @name getGameByTitle
     * @param title the title to get game information from
     * @returns object containing game information
     */
	async getGameByTitle(title) {
		try {
			if(!this.validator.checkMultipleWordsOnlyAlphaNumberic(title)) throw new Error('Must supply a valid title')

			let sql = `SELECT count(ID) AS count FROM game WHERE title = "${title}";`
			let records = await this.db.get(sql)
			if(records.count === 0) throw new Error(`Game: "${title}" not found`)


			sql = `SELECT * FROM game WHERE title = "${title}";`

			records = await this.db.get(sql)

			const data = {
				ID: records.ID,
				title: title,
				summary: records.summary,
				desc: records.desc
			}

			return data
		} catch(err) {
			throw err
		}
	}

	async updateGameByID(id, data) {
		this.validator.checkID(id, 'ID')

		const title = data.title
		const desc = data.desc
		const summary = data.summary


		this.checkGameFields(title,summary,desc)


		let sql = `SELECT count(ID) AS count FROM game WHERE title = "${title}";`
		const records = await this.db.get(sql)
		if(records.count !== 0) throw new Error(`Game: "${title}" already exists`)

		sql = `
		UPDATE game
		SET desc = "${desc}",
		summary = "${summary}",
		title = "${title}"
		WHERE ID = ${id};
		`
		await this.db.get(sql)

		return true

	}

	async deleteGameByID(ID) {
		this.validator.checkID(ID, 'ID')

		let sql = `SELECT count(ID) AS count FROM game WHERE ID = ${ID};`
		const records = await this.db.get(sql)
		if(records.count === 0) {
			throw new Error('ID doesn\'t exist')
		}

		sql = [`DELETE FROM game_category
            WHERE gameID = ${ID};
            `,`DELETE FROM gamePhoto
            WHERE gameID = ${ID};
            `,`DELETE FROM game_publisher
            WHERE gameID = ${ID};
            `,`DELETE FROM game
            WHERE ID = ${ID}`]

		for(let i = 0; i < sql.length; i++) await this.db.run(sql[i])

		return true
	}

}
