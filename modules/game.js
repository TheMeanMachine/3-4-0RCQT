
'use strict'

const sqlite = require('sqlite-async')
//const sharp = require('sharp')
//Custom modules
const valid = require('./validator')
const Image = require('./image')
const Review = require('./review')
module.exports = class Game {
	// eslint-disable-next-line max-lines-per-function
	constructor(dbName) {
		this.validator = new valid()

		return (async() => {
			this.dbName = dbName || ':memory:'
			this.image = await new Image(this.dbName)
			this.review = await new Review(this.dbName)
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

			const sql = `SELECT * FROM game WHERE ID = ${ID};`
			const records = await this.db.get(sql)

			const data = {
				ID: ID,
				title: records.title,
				summary: records.summary,
				desc: records.desc,
				pictures: (await this.image.getPicturesByGameID(ID)).pictures,
				avgRating: Math.round(await this.review.getAverageRating(ID))
			}
			console.log(data)
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
			data[i].pictures =(await this.image.getPicturesByGameID(data[i].ID)).pictures//Get pictures for the game
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
				desc: records.desc,
				pictures: (await this.image.getPicturesByGameID(records.ID)).pictures//Get pictures for the game
			}

			return data
		} catch(err) {
			throw err
		}
	}
	/**
     * Function to get update game information based on an ID
     *
     * @name updateGameByID
     * @param ID the ID referring to the game needing update
	 * @param data the data in an object to apply to the game e.g. data = {title: "This is a new title"}
     * @returns true if successful
     */
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
	/**
     * Function to get delete game information based on an ID
     *
     * @name deleteGameByID
     * @param ID the ID referring to the game needing update
	 * * @returns true if successful
     */
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
