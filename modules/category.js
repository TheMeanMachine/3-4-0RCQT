/* eslint-disable max-lines */
/* eslint-disable max-statements */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */

'use strict'

const sqlite = require('sqlite-async')

//Custom modules
const valid = require('./validator')


module.exports = class Category {
	constructor(dbName) {
		this.validator = new valid()

		return (async() => {
			this.dbName = dbName || ':memory:'
			this.db = await sqlite.open(this.dbName)

			const sql =
            [`
            CREATE TABLE IF NOT EXISTS game_category(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                gameID INTEGER,
                categoryID INTEGER,
                FOREIGN KEY (gameID) REFERENCES game(ID),
                FOREIGN KEY (categoryID) REFERENCES category(ID)
            );`,`
            CREATE TABLE IF NOT EXISTS category(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT
            );`
            ]
			for(let i = 0; i < sql.length; i++) {
				await this.db.run(sql[i])
			}

			return this
		})()

	}

	async addCategory(name) {
		// eslint-disable-next-line eqeqeq
		if(name == null || !this.validator.checkMultipleWordsOnlyAlphaNumberic(name)) {
			throw new Error('Must supply name')
		}

		let sql = `SELECT count(ID) AS count FROM category WHERE title = "${name}";`
		const records = await this.db.get(sql)
		if(records.count !== 0) {
			throw new Error('Category already exists')
		}

		sql = `INSERT INTO category (title)
                VALUES(
                    "${name}"
                )`
		const result = await this.db.run(sql)
		return result.lastID
	}

	async getCategoryByID(catID) {
		try{
			if(catID === null || isNaN(catID)) {
				throw new Error('Must supply catID')
			}

			let sql = `SELECT count(ID) AS count FROM category WHERE ID = ${catID};`
			let records = await this.db.get(sql)
			if(records.count === 0) {
				throw new Error('Category not found')
			}

			sql = `SELECT * FROM category WHERE ID = ${catID};`

			records = await this.db.get(sql)
			return records

		}catch(e) {
			throw e
		}
	}

}
