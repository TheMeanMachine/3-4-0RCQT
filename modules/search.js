'use strict'

const sqlite = require('sqlite-async')
//Custom modules
const valid = require('./validator')
const Game = require('./game')
const Review = require('./review')
const Category = require('./category')
const Publisher = require('./publisher')
module.exports = class Search {
	constructor(dbName) {
		this.validator = new valid()

		return (async() => {
			this.dbName = dbName || ':memory:'

			this.db = await sqlite.open(this.dbName)

			this.review = await new Review(this.dbName)
			this.game = await new Game(this.dbName)
			this.category = await new Category(this.dbName)
			this.publisher = await new Publisher(this.dbName)


			return this
		})()

	}
}
