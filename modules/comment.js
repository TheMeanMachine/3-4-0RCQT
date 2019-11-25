'use strict'

const sqlite = require('sqlite-async')
//Custom modules
const valid = require('./validator')

module.exports = class Comment {
	constructor(dbName) {
		this.validator = new valid()

		return (async() => {

			this.dbName = dbName || ':memory:'
			this.db = await sqlite.open(this.dbName)

			const sql =
			`CREATE TABLE IF NOT EXISTS comments(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                userID INTEGER,reviewID INTEGER,fullText,
                FOREIGN KEY (userID) REFERENCES user(ID),
                FOREIGN KEY (reviewID) REFERENCES review(ID)
            );`

			await this.db.run(sql)

			return this
		})()
	}
	async addComment(reviewID, userID, fullText) {
		this.validator.checkID(reviewID, 'reviewID')
		this.validator.checkID(userID, 'userID')
		if(!this.validator.checkMultipleWordsOnlyAlphaNumberic(fullText))throw new Error('Must supply fulltext')

		const sql = `INSERT INTO comments (reviewID, userID, fullText) VALUES (
            ${reviewID},${userID},"${fullText}");`

		const result = await this.db.run(sql)

		return result.lastID
	}

	async deleteCommentByID(commentID) {
		this.validator.checkID(commentID, 'commentID')

		const sql = `DELETE FROM comments
		WHERE ID = ${commentID};`

		await this.db.run(sql)

		return true
	}

	async getCommentsByReviewID(reviewID) {
		this.validator.checkID(reviewID, 'reviewID')

		const sql = `SELECT * FROM comments
		WHERE reviewID = ${reviewID};`

		const data = await this.db.all(sql)

		const result = {comments: []}
		for(let i = 0; i < Object.keys(data).length; i++) {
			result.comments.push(data[i])
		}
		return result
	}
}
