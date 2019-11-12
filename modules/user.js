
'use strict'

const bcrypt = require('bcrypt-promise')
// const fs = require('fs-extra')
const mime = require('mime-types')
const sqlite = require('sqlite-async')
const saltRounds = 10

module.exports = class User {

	constructor(dbName) {

		return (async() => {
			this.dbName = dbName || ':memory:';
			this.db = await sqlite.open(this.dbName);
			const sql = `
			CREATE TABLE IF NOT EXISTS user(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                pass TEXT,
                avatar TEXT,
                roleID INTEGER,
                FOREIGN KEY (roleID) REFERENCES role(ID)
			);`
			await this.db.run(sql);

			return this
		})()
		
	}

	async register(user, pass) {
		try {
			if(user.length === 0) throw new Error('missing username')
			if(pass.length === 0) throw new Error('missing password')
			let sql = `SELECT COUNT(ID) as records FROM user WHERE username="${user}";`
			const data = await this.db.get(sql)
			if(data.records !== 0) throw new Error(`username "${user}" already in use`)
			pass = await bcrypt.hash(pass, saltRounds)
			sql = `INSERT INTO user(username, pass) VALUES("${user}", "${pass}")`
			await this.db.run(sql)
			return true
		} catch(err) {
			throw err
		}
	}

	async uploadPicture(path, mimeType) {
		const extension = mime.extension(mimeType)
		console.log(`path: ${path}`)
		console.log(`extension: ${extension}`)
		await fs.copy(path, `public/avatars/${username}.${fileExtension}`)
	}

	async login(username, password) {
		try {
			let sql = `SELECT count(ID) AS count FROM user WHERE username="${username}";`
			const records = await this.db.get(sql)
			if(!records.count) throw new Error(`username "${username}" not found`)
			sql = `SELECT pass FROM user WHERE username = "${username}";`
			const record = await this.db.get(sql)
			const valid = await bcrypt.compare(password, record.pass)
			if(valid === false) throw new Error(`invalid password for account "${username}"`)
			return true
		} catch(err) {
			throw err
		}
	}

}
