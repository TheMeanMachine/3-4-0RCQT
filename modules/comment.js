'use strict'

const sqlite = require('sqlite-async')
//Custom modules
const valid = require('./validator')

module.exports = class Review {
	constructor(dbName) {
		this.validator = new valid()

		return (async() => {

			this.dbName = dbName || ':memory:'
			this.db = await sqlite.open(this.dbName)

			const sql =
			[`CREATE TABLE IF NOT EXISTS comments(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                userID INTEGER,reviewID INTEGER,fullText,
                FOREIGN KEY (userID) REFERENCES user(ID),
                FOREIGN KEY (reviewID) REFERENCES review(ID)
            );`]

			for(let i = 0; i < sql.length; i++) await this.db.run(sql[i])

			return this
		})()
	}

}
