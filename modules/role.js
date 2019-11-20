'use strict'

const sqlite = require('sqlite-async')


//Custom modules
const valid = require('./validator')

module.exports = class role {

	constructor(dbName) {
		this.validator = new valid()
		return (async() => {
			this.dbName = dbName || ':memory:'
			this.db = await sqlite.open(this.dbName)

			const sql =`CREATE TABLE IF NOT EXISTS role(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT,
                UNIQUE(ID, role)
            );`
			await this.db.run(sql)
			await this.generateRoles('user', 'admin')


			return this
		})()
	}

	async generateRoles(...roles) {
		for(let i = 0; i < roles.length; i++) {
			const sql = `
            INSERT OR IGNORE INTO role (ID, role)
            VALUES(${i}, '${roles[i]}');
            `
			await this.db.run(sql)
		}
		return true
	}

}
