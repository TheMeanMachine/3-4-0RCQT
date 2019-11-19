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

		const sql = `INSERT INTO category (title)
                VALUES(
                    "${name}"
                )`
		const result = await this.db.run(sql)
		return result.lastID
	}

}
