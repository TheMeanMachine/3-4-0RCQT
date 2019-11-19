
'use strict'

const bcrypt = require('bcrypt-promise')
const fs = require('fs-extra')
const mime = require('mime-types')
const sqlite = require('sqlite-async')
const saltRounds = 10

//Custom modules
const valid = require('./validator');

module.exports = class User {

	constructor(dbName) {
		this.validator = new valid();
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

	checkUserFields(user, pass){
        if(user != null){
            let checkUser = this.validator.check_MultipleWordsOnlyAlphaNumberic(user);
            if(!checkUser){
                throw new Error('Must supply user');
            }
        }
        if(pass != null){
            let checkUser = this.validator.check_MultipleWordsOnlyAlphaNumberic(pass);
            if(!checkUser){
                throw new Error('Must supply pass');
            }
        }
        
        return true;
    }

	async register(user, pass) {
		try {
			try{
				this.checkUserFields(user, pass);
			}catch(e){
				throw e;
			}
			
			let sql = `SELECT COUNT(ID) as records FROM user WHERE username="${user}";`
			const data = await this.db.get(sql)
			if(data.records !== 0) throw new Error(`username "${user}" already in use`)
			pass = await bcrypt.hash(pass, saltRounds)
			sql = `INSERT INTO user(username, pass) VALUES("${user}", "${pass}")`
			const record = await this.db.run(sql)
			return record.lastID;
		} catch(err) {
			throw err
		}
	}

	async uploadPicture(path, mimeType, userID) {

		if(userID == null || isNaN(userID)){
			throw new Error('Must supply userID');
		}

		if(path === null || path.length === 0){
			throw new Error('Must supply path');
		}

		if(mimeType === null || mimeType.length === 0){
			throw new Error('Must supply type');
		}

		const extension = mime.extension(mimeType)
		await this.getUserByID(userID);

		const picPath = `public/users/${userID}/profile.${extension}`;
		await fs.copy(path, picPath)

		let sql = `
		UPDATE user
		SET avatar = "${picPath}"
		WHERE ID = ${userID};`
		await this.db.run(sql);

		
		return true;
	}

	async getUserByID(userID){
		try {
            if(userID == null || isNaN(userID)){
                throw new Error('Must supply userID');
            }
			let sql = `SELECT count(ID) AS count FROM user WHERE ID = ${userID};`
            let records = await this.db.get(sql)
			if(records.count == 0){
                throw new Error(`User not found`);
            }

            sql = `SELECT * FROM user WHERE ID = ${userID};`;

            records = await this.db.get(sql);
            
            let data = {
                ID: userID,
				username: records.username,
				avatar: records.avatar
            }
            
			return data;
		} catch(err) {
			throw err
		}
	}

	async login(username, password) {
		try {
			let sql = `SELECT count(ID) AS count FROM user WHERE username="${username}";`
			const records = await this.db.get(sql)
			if(!records.count) throw new Error(`username "${username}" not found`)
			sql = `SELECT pass, ID FROM user WHERE username = "${username}";`
			const record = await this.db.get(sql)
			const valid = await bcrypt.compare(password, record.pass)
			if(valid === false) throw new Error(`invalid password for account "${username}"`)
			return record.ID;
		} catch(err) {
			throw err
		}
	}

}
