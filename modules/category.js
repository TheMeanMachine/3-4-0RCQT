

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

	async associateToCategory(gameID, categoryID) {
		try{
			this.validator.checkID(gameID, 'gameID')
			this.validator.checkID(categoryID, 'categoryID')

			await this.game.getGameByID(gameID)

			await this.getCategoryByID(categoryID)

			const sql = `INSERT INTO game_category (gameID, categoryID)
            VALUES(
                ${gameID},
                ${categoryID}
            );`
			await this.db.run(sql)
			return true
		}catch(e) {
			throw e
		}
	}

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

	async getCategories(gameID) {
		try{
			this.validator.checkID(gameID, 'gameID')//Check gameID is valid

			await this.game.getGameByID(gameID)//Check game exists

			const sql = `
			SELECT * FROM game_category
			WHERE gameID = ${gameID};`

			const data = await this.db.all(sql)
			const result = { categories: [] }
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

	async getAllCategories() {
		const sql = `
			SELECT * FROM category;`

		const data = await this.db.all(sql)
		if(Object.keys(data).length === 0) throw new Error('No categories found')
		const result = { categories: [] }
		for(let i = 0; i < Object.keys(data).length; i++) {
			const curCat = await this.getCategoryByID(data[i].ID)//Retrieve full information
			data[i].title = curCat.title//Add title to data
			result.categories.push(data[i])
		}


		return result
	}

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

	async deleteByID(catID) {
		try{
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
		}catch(e) {
			throw e
		}
	}
}
