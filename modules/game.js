
'use strict'

const mime = require('mime-types')
const sqlite = require('sqlite-async')

//Custom modules
const valid = require('./validator');
const Publishers = require('./publisher');


module.exports = class Game {

	constructor(dbName) {
        this.validator = new valid();

		return (async() => {
            this.dbName = dbName || ':memory:';
            this.publisher = new Publishers(this.dbName);
            this.db = await sqlite.open(this.dbName);
            
            const sql = 
            [`
			CREATE TABLE IF NOT EXISTS game(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                summary TEXT,
                desc TEXT
            );
            `,`
            CREATE TABLE IF NOT EXISTS gamePhoto(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                gameID INTEGER,
                picture TEXT,
                FOREIGN KEY (gameID) REFERENCES game(ID)
            );
            `,`
            CREATE TABLE IF NOT EXISTS game_category(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                gameID INTEGER,
                categoryID INTEGER,
                FOREIGN KEY (gameID) REFERENCES game(ID),
                FOREIGN KEY (categoryID) REFERENCES category(ID)
            );
            `,`
            CREATE TABLE IF NOT EXISTS game_publisher(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                gameID INTEGER,
                publisherID INTEGER,
                FOREIGN KEY (gameID) REFERENCES game(ID),
                FOREIGN KEY (publisherID) REFERENCES publisher(ID)
            );
            `]
            
            for(let i = 0; i < sql.length; i++){
                await this.db.run(sql[i]);
            }
			
			return this;
		})()
		
    }

    async associateToPublisher(gameID, publisherID){
        try{
            let sql = `INSERT INTO game_publisher (gameID, publisherID)
            VALUES(
                ${gameID},
                ${publisherID}
            );`;
            await this.db.run(sql);
            return true;
        }catch(e){
            throw e;
        }  
    }

    async getPublishers(gameID){
        try{
            const sql = `SELECT * FROM game_publisher 
            WHERE gameID = ${gameID};`;

            const data = await this.db.all(sql);

            let result = {publishers:[]};
            for(let i = 0; i < Object.keys(data).length; i++){
                result.publishers.push(data[i].ID);
            }
            console.log(result);
            return result;
        }catch(e){
            throw e;
        }  
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

    async getGameByID(ID) {
		try {
            if(ID == null || isNaN(ID)){
                throw new Error('Must supply ID');
            }
			let sql = `SELECT count(ID) AS count FROM game WHERE ID = ${ID};`
            let records = await this.db.get(sql)
			if(records.count == 0){
                throw new Error(`Game not found`);
            }

            sql = `SELECT * FROM game WHERE ID = ${ID};`;

            records = await this.db.get(sql);
            
            let data = {
                ID: ID,
                title: records.title,
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
        if(id == null || isNaN(id)){
            throw new Error('Must supply ID');
        }

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

    async deleteGameByID(ID){
        if(ID == null || isNaN(ID)){
            throw new Error('Must supply ID');
        }

        let sql = `SELECT count(ID) AS count FROM game WHERE ID = ${ID};`;
        let records = await this.db.get(sql);
        if(records.count === 0){
            throw new Error(`ID doesn't exist`);
        }

        sql = [`
            DELETE FROM game_category
            WHERE gameID = ${ID};
            `,`
            DELETE FROM gamePhoto
            WHERE gameID = ${ID};
            `,`
            DELETE FROM game_publisher
            WHERE gameID = ${ID};
            `,`
            DELETE FROM game
            WHERE ID = ${ID}`
        ];

        for(let i = 0; i < sql.length; i++){
            await this.db.run(sql[i]);
        }

        return true;
    }

}
