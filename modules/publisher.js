/* eslint-disable max-lines */
/* eslint-disable max-statements */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */

'use strict'

const sqlite = require('sqlite-async')

//Custom modules
const valid = require('./validator')


module.exports = class Publisher {


	constructor(dbName) {
		this.validator = new valid()

		return (async() => {
			this.dbName = dbName || ':memory:'
			this.db = await sqlite.open(this.dbName)

			const sql =
            [`
            CREATE TABLE IF NOT EXISTS game_publisher(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                gameID INTEGER,
                publisherID INTEGER,
                FOREIGN KEY (gameID) REFERENCES game(ID),
                FOREIGN KEY (publisherID) REFERENCES publisher(ID)
            );`,`

            CREATE TABLE IF NOT EXISTS publisher(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT
            );`
            ]
			for(let i = 0; i < sql.length; i++) {
				await this.db.run(sql[i])
			}

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
		if(name !== null) {
			const checkName = this.validator.checkMultipleWordsOnlyAlphaNumberic(name)
			if(!checkName) {
				throw new Error('Must supply name')
			}
		}else{
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
			if(ID === null || isNaN(ID)) {
				throw new Error('Must supply ID')
			}

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
