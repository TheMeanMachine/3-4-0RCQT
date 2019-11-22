'use strict'

const sqlite = require('sqlite-async')

//Custom modules
const valid = require('./validator')
const Games = require('./game')

module.exports = class Publisher {


	constructor(dbName) {
		this.validator = new valid()

		return (async() => {
			this.dbName = dbName || ':memory:'
			this.db = await sqlite.open(this.dbName)
			this.game = await new Games(this.dbName)
			const sql =
            [`CREATE TABLE IF NOT EXISTS game_publisher(ID INTEGER PRIMARY KEY AUTOINCREMENT,
            	gameID INTEGER,publisherID INTEGER,
                FOREIGN KEY (gameID) REFERENCES game(ID),FOREIGN KEY (publisherID) REFERENCES publisher(ID));`,`

            CREATE TABLE IF NOT EXISTS publisher(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT
            );`
            ]
			for(let i = 0; i < sql.length; i++) await this.db.run(sql[i])

			return this
		})()

	}
	/**
     * Function to check fields associated with publisher
     *
     * @name checkPublisherFields
     * @param name name to check against
     * @throws Error if name is not given or doesn't satify checks
     * @returns true if no problems
     *
     */
	checkPublisherFields(name) {

		const checkName = this.validator.checkMultipleWordsOnlyAlphaNumberic(name)
		if(!checkName ) {
			throw new Error('Must supply name')
		}

		return true
	}

	/**
     * Function to addPublisher
     *
     * @name addPublisher
     * @param name name of publisher to add
     * @returns ID of new publisher
     *
     */
	async addPublisher(name) {
		try{
			this.checkPublisherFields(name)

			const sql = `INSERT INTO publisher (name)
                VALUES(
                    "${name}"
                )`
			const result = await this.db.run(sql)
			return result.lastID
		}catch(e) {
			throw e
		}

	}

	async getGamesOfPublisher(pubID) {
		this.validator.checkID(pubID, 'pubID')

		const sql = `
			SELECT * FROM game_publisher
			WHERE publisherID = ${pubID};`

		const publishers = await this.db.all(sql)

		const result = { games: []}
		for(let i = 0; i < Object.keys(publishers).length; i++) {

			const gameData = await this.game.getGameByID(publishers[i].gameID)
			result.games.push(gameData)

		}

		return result
	}

	async getAllPublishers() {
		const sql = 'SELECT * FROM publisher;'

		const data = await this.db.all(sql)
		const result = { publishers: [] }
		for(let i = 0; i < Object.keys(data).length; i++) {
			const curPub = await this.getPublisherByID(data[i].ID)//Retrieve full information
			data[i].name = curPub.name//Add title to data
			result.publishers.push(data[i])
		}

		return result
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
			this.validator.checkID(gameID, 'gameID')

			const sql = `SELECT * FROM game_publisher 
            WHERE gameID = ${gameID};`

			const data = await this.db.all(sql)
			const result = { publishers: [] }
			for(let i = 0; i < Object.keys(data).length; i++) {
				data[i].name = (await this.getPublisherByID(data[i].publisherID)).name
				result.publishers.push(data[i])
			}

			return result
		} catch(e) {
			throw e
		}
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
     * Function to get publisher by ID
     *
     * @name getPublisherByID
     * @param ID ID of publisher to get
     * @returns Name of publisher
     *
     */
	async getPublisherByID(ID) {
		try{
			this.validator.checkID(ID, 'ID')

			let sql = `SELECT count(ID) AS count FROM publisher WHERE ID = ${ID};`
			let records = await this.db.get(sql)
			if(records.count === 0) {
				throw new Error('Publisher not found')
			}

			sql = `SELECT * FROM publisher WHERE ID = ${ID};`

			records = await this.db.get(sql)
			return records

		}catch(e) {
			throw e
		}
	}
	/**
     * Function to delete publisher by ID
     *
     * @name deletePublisherByID
     * @param ID ID of publisher to delete
     * @returns true if successful
     *
     */
	async deletePublisherByID(ID) {
		try{
			if(ID === null || isNaN(ID)) {
				throw new Error('Must supply ID')
			}

			const sql = [`
            DELETE FROM game_publisher
            WHERE publisherID = ${ID};
            `,`
            DELETE FROM publisher
            WHERE ID = ${ID}`
			]

			for(let i = 0; i < sql.length; i++) {
				await this.db.run(sql[i])
			}

			return true
		}catch(e) {
			throw e
		}
	}

}
