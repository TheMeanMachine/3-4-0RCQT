
'use strict'

const mime = require('mime-types')
const sqlite = require('sqlite-async')


module.exports = class game {

	constructor(dbName) {

		return (async() => {
            this.dbName = dbName || ':memory:';
			this.db = await sqlite.open(this.dbName);
			const sql = `
			CREATE TABLE IF NOT EXISTS game(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                summary TEXT,
                desc TEXT
            );`;
			await this.db.run(sql);
			return this;
		})()
		
    }

    async addNewGame(title, summary, desc){
        try{
            let sql = `SELECT COUNT(id) as records FROM game WHERE title="${title}";`;
			const data = await this.db.get(sql);
			if(data.records !== 0){
                throw new Error(`Game "${title}" already exists`);
            }

            let sql = `INSERT INTO game (title, summary, desc)
            VALUES(
                ${title},
                ${summary},
                ${desc}
            )`;
            await this.db.run(sql);
			return true;
        }catch(err){
            throw err;
        }
    }
    

	async getGameByTitle(title) {
		try {
			let sql = `SELECT * from game WHERE title = "${title}" LIMIT 1;`
			const records = await this.db.get(sql)
			if(!records.count){
                throw new Error(`Game: "${title}" not found`)
            }
            
            data = {
                id : record.id,
                title : title || '',
                summary : records.summary || '',
                desc : records.summary || '',
                setTitle : (title) =>{
                    this.title = title;
                }
            }

			return data;
		} catch(err) {
			throw err
		}
	}

	

}
