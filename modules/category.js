'use strict'

const sqlite = require('sqlite-async')

//Custom modules
const valid = require('./validator')
const Games = require('./game')


module.exports = class Category {
	constructor(dbName) {
		this.validator = new valid()

		return (async() => {
			this.dbName = dbName || ':memory:'
			this.db = await sqlite.open(this.dbName)
			this.game = await new Games(this.dbName)
			const sql =
			[`CREATE TABLE IF NOT EXISTS game_category
			(ID INTEGER PRIMARY KEY AUTOINCREMENT,gameID INTEGER,categoryID INTEGER,
			FOREIGN KEY (gameID) REFERENCES game(ID),
			FOREIGN KEY (categoryID) REFERENCES category(ID));`
			,'CREATE TABLE IF NOT EXISTS category(ID INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT);']
			for(let i = 0; i < sql.length; i++) {
				await this.db.run(sql[i])
			}

			return this
		})()

	}

	async searchCategories(toSearch) {
		this.validator.checkStringExists(toSearch, 'toSearch')

		const sql = `
        SELECT * FROM category
		WHERE (title LIKE "%${toSearch}%");`
		const data = await this.db.all(sql)
		const result = { categories: []}
		for(let i = 0; i < Object.keys(data).length; i++) {
			const curCat = await this.getCategoryByID(data[i].ID)//Retrieve full information
			data[i].title = curCat.title//Add title to data
			data[i].games = (await this.getGamesOfCategory(data[i].ID)).games
			result.categories.push(data[i])
		}


		return result
	}

	/**
     * Function to associate a game with a category
     *
     * @name associateToCategory
     * @param gameID the gameID to associate
	 * @param categoryID the categoryID to associate
	 * @throws If categoryID or gameID not supplied
     * @returns true if rating is valid
     */
	async associateToCategory(gameID, categoryID) {

		this.validator.checkID(gameID, 'gameID')
		this.validator.checkID(categoryID, 'categoryID')

		const sql = `INSERT INTO game_category (gameID, categoryID)
		VALUES(
			${gameID},
			${categoryID}
		);`
		await this.db.run(sql)
		return true

	}
	/**
     * Function to remove an association a game has with a category
     *
     * @name unassociateToCategory
     * @param gameID the gameID to associate
	 * @param categoryID the categoryID to associate
	 * @throws If categoryID or gameID not supplied
     * @returns true if rating is valid
     */
	async unassociateToCategory(gameID, categoryID) {
		try{
			this.validator.checkID(gameID, 'gameID')
			this.validator.checkID(categoryID, 'categoryID')

			const sql = `DELETE FROM game_category
			WHERE gameID = ${gameID}
			AND categoryID = ${categoryID};`
			await this.db.run(sql)
			return true
		}catch(e) {
			throw e
		}
	}
	/**
     * Function to get categories based on a gameID
     *
     * @name getCategories
     * @param gameID the gameID to associate
	 * @throws If gameID not supplied
     * @returns true if rating is valid
     */
	async getCategories(gameID) {
		try{
			this.validator.checkID(gameID, 'gameID')//Check gameID is valid

			const sql = `
			SELECT * FROM game_category
			WHERE gameID = ${gameID};`

			const data = await this.db.all(sql)
			const result = { categories: []}
			for(let i = 0; i < Object.keys(data).length; i++) {

				const curCat = await this.getCategoryByID(data[i].categoryID)//Retrieve full information
				data[i].title = curCat.title//Add title to data

				result.categories.push(data[i])
			}

			return result
		}catch(e) {
			throw e
		}
	}

	/**
     * Function to add a new category
     *
     * @name addCategory
     * @param name - Name of the new category
	 * @throws If name not supplied
	 * @throws If category already exists
     * @returns database ID of inserted category
     */
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

	/**
     * Function to get categories based on a categoryID
     *
     * @name getCategoryByID
     * @param catID the catID to get
	 * @throws If catID not supplied
     * @returns category data
     */
	async getCategoryByID(catID) {

		this.validator.checkID(catID, 'catID')

		let sql = `SELECT count(ID) AS count FROM category WHERE ID = ${catID};`
		let records = await this.db.get(sql)
		if(records.count === 0) {
			throw new Error('Category not found')
		}

		sql = `SELECT * FROM category WHERE ID = ${catID};`

		records = await this.db.get(sql)
		return records


	}
	/**
     * Function to get all categories
     *
     * @name getAllCategories
     * @returns category data in object e.g. {categories:[object{},object{}]}
     */
	async getAllCategories() {
		const sql = `
			SELECT * FROM category;`

		const data = await this.db.all(sql)
		const result = { categories: [] }
		for(let i = 0; i < Object.keys(data).length; i++) {
			const curCat = await this.getCategoryByID(data[i].ID)//Retrieve full information
			data[i].title = curCat.title//Add title to data
			result.categories.push(data[i])
		}


		return result
	}

	/**
     * Function to get all categories not associated with a gameID
     *
     * @name getOtherCategories
     * @param gameID the gameID to get categories based on
	 * @throws If gameID not supplied
     * @returns category data not already associated
     */
	async getOtherCategories(gameID) {
		this.validator.checkID(gameID, 'gameID')

		const allCat = (await this.getAllCategories()).categories

		const allGameCat = (await this.getCategories(gameID)).categories

		const result = {categories: []}

		for(let i = 0; i < allCat.length; i++) {
			let flag = false
			for(let j = 0; j < allGameCat.length; j++) {
				if(allCat[i].ID === allGameCat[j].categoryID) {
					flag = true
					break
				}
			}
			if(!flag) result.categories.push(allCat[i])
		}

		return result
	}

	/**
     * Function to get all games based on a categoryID
     *
     * @name getGamesOfCategory
     * @param catID the category ID to get games based on
	 * @throws If catID not supplied
     * @returns games associated with a category
     */
	async getGamesOfCategory(catID) {
		this.validator.checkID(catID, 'catID')

		const sql = `
			SELECT * FROM game_category
			WHERE categoryID = ${catID};`

		const categories = await this.db.all(sql)

		const result = { games: []}
		for(let i = 0; i < Object.keys(categories).length; i++) {

			const gameData = await this.game.getGameByID(categories[i].gameID)
			result.games.push(gameData)

		}

		return result
	}

	/**
     * Function to delete a category based on a ID
     *
     * @name deleteByID
     * @param catID the category ID to get games based on
	 * @throws If catID not supplied
     * @returns true if successful
     */
	async deleteByID(catID) {

		this.validator.checkID(catID, 'catID')

		const sql = [`
		DELETE FROM game_category
		WHERE categoryID = ${catID};
		`,`
		DELETE FROM category
		WHERE ID = ${catID}`
		]

		for(let i = 0; i < sql.length; i++) {
			await this.db.run(sql[i])
		}

		return true

	}
}
