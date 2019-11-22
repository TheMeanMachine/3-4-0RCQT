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

	/**
     * Function to add roles to the role table
     *
     * @name generateRoles
     * @param roles a list of roles to add
	 * @returns true if successful
     */
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

	/**
     * Function to get role information based on a ID
     *
     * @name getRoleByID
     * @param roleID the ID to get data based on
	 * @throws if role does not exists
	 * @throws if roleID is not supplied
	 * @returns role data
     */
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
