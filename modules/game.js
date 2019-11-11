
'use strict'

const mime = require('mime-types')
const sqlite = require('sqlite-async')

//Custom modules
const valid = require('./validator');


module.exports = class Game {

	constructor(dbName) {
        this.validator = new valid();

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
            try{
                this.checkGameFields(title, summary, desc);
            }catch(e){
                throw e;
            }

            let sql = `SELECT COUNT(id) as records FROM game WHERE title="${title}";`;
			const data = await this.db.get(sql);
			if(data.records !== 0){
                throw new Error(`Game "${title}" already exists`);
            }

            sql = `INSERT INTO game (title, summary, desc)
            VALUES(
                "${title}",
                "${summary}",
                "${desc}"
            )`;
            await this.db.run(sql);
			return true;
        }catch(err){
            throw err;
        }
    }
    
    checkGameFields(title, summary, desc){
        if(title != null){
            let checkTitle = this.validator.check_MultipleWordsOnlyAlphaNumberic(title);
            if(!checkTitle){
                throw new Error('Must supply title');
            }
        }
        if(summary != null){
            let checkSummary = this.validator.check_MultipleWordsOnlyAlphaNumberic(summary);
            if(!checkSummary){
                throw new Error('Must supply summary');
            }
        }
        if(desc != null){
            let checkDesc = this.validator.check_MultipleWordsOnlyAlphaNumberic(desc);
            if(!checkDesc){
                throw new Error('Must supply description');
            }
        }
        return true;
    }

	async getGameByTitle(title) {
		try {
            if(!this.validator.check_MultipleWordsOnlyAlphaNumberic(title)){
                    throw new Error(`Must supply a valid title`);
            }
			let sql = `SELECT count(ID) AS count FROM game WHERE title = "${title}";`
            let records = await this.db.get(sql)
			if(records.count == 0){
                throw new Error(`Game: "${title}" not found`)
            }

            sql = `SELECT * FROM game WHERE title = "${title}";`

            records = await this.db.get(sql)
            
            let data = {
                ID: records.ID,
                title: title,
                summary: records.summary,
                desc: records.desc,
                game: this,
                setTitle (string){
                    try{
                        this.game.checkGameFields(string);
                        this.title = string;
                    }catch(e){
                        throw e;
                    }
                },
                setSummary (string){
                    try{
                        this.game.checkGameFields(null, string);
                        this.summary = string;
                    }catch(e){
                        throw e;
                    }
                    
                },
                setDesc (string){
                    try{
                        this.game.checkGameFields(null, null, string);
                        this.desc = string;
                    }catch(e){
                        throw e;
                    }
                    
                    
                }
            }
            
			return data;
		} catch(err) {
			throw err
		}
	}

	async updateGameByID(id, data){
        let title = data.title || null;
        let desc = data.desc || null;
        let summary = data.summary || null;
        
        let count = Object.keys(data).length;
        let done = 0;

    
        
        this.checkGameFields(title,summary,desc);

        

        if(title != null){
            let sql = `SELECT count(ID) AS count FROM game WHERE title = "${title}";`;
            let records = await this.db.get(sql);
            if(records.count != 0){
                throw new Error(`Game: "${title}" already exists`);
            }

            sql = `
            UPDATE game
            SET title = "${title}"
            WHERE ID = ${id};
            `;

            
            let result = await this.db.get(sql);
            done++;
            
        }

        if(summary != null){
            let sql = `
            UPDATE game
            SET summary = "${summary}"
            WHERE ID = ${id};
            `;

        
            let result = await this.db.get(sql);
            done++;
            
            
            
        }
        
        if(desc != null){
            let sql = `
            UPDATE game
            SET desc = "${desc}"
            WHERE ID = ${id};
            `;

            
            let result = await this.db.get(sql);
            done++;
            
        }

        if(done === count){
            return true;
        }
        throw(new Error('Could not update field(s)'))
        
    }

}
