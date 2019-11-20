'use strict'

const sqlite = require('sqlite-async')


//Custom modules
const valid = require('./validator')
const User = require('./user')

module.exports = class role {

	constructor(dbName) {
		this.validator = new valid()
		return (async() => {
			this.dbName = dbName || ':memory:'
			this.db = await sqlite.open(this.dbName)
			this.user = await new User(this.dbName)
			const sql =
            [`CREATE TABLE IF NOT EXISTS role(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT
            );`,
            `INSERT INTO role (role)
            VALUES ("user"),
            ("admin")`]

			for(let i = 0; i < sql.length; i++) {
				await this.db.run(sql[i])
			}

			return this
		})()
	}

	async associateRole(roleID, userID) {
		try{
			this.validator.checkID(userID, 'userID')
			this.validator.checkID(roleID, 'roleID')

			await this.user.getUserByID(userID)
			//await this.getRoleByID(roleID)

			await this.user.updateUser(userID, {
				roleID: roleID
			})

			return true
		}catch(e) {
			throw e
		}
	}


}
