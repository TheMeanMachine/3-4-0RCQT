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
		for(let i = 1; i < roles.length+1; i++) {
			const sql = `
            INSERT OR IGNORE INTO role (ID, role)
            VALUES(${i}, '${roles[i-1]}');
            `
			await this.db.run(sql)
		}
		return true

	}

	async getRoleByID(roleID) {
		this.validator.checkID(roleID, 'roleID')

		let sql = `SELECT count(ID) AS count FROM role WHERE ID = ${roleID};`
		let records = await this.db.get(sql)
		if(records.count === 0) {
			throw new Error('Role not found')
		}

		sql = `SELECT * FROM role WHERE ID = ${roleID};`

		records = await this.db.get(sql)

		return records
	}

}
