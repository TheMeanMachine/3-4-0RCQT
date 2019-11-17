'use strict'

const sqlite = require('sqlite-async')

//Custom modules
const valid = require('./validator');
const Games = require('./game');


module.exports = class Game {


    constructor(dbName) {
    this.validator = new valid();

    return (async() => {
        this.dbName = dbName || ':memory:';
        this.db = await sqlite.open(this.dbName);
        this.games = await new Games(this.dbName);
        const sql = 
        [`
        CREATE TABLE IF NOT EXISTS game_publisher(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            gameID INTEGER,
            publisherID INTEGER,
            FOREIGN KEY (gameID) REFERENCES game(ID),
            FOREIGN KEY (publisherID) REFERENCES publisher(ID)
        );`,`

        CREATE TABLE IF NOT EXISTS publisher(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT
        );`
        ];
        for(let i = 0; i < sql.length; i++){
            await this.db.run(sql[i]);
        }
        
        return this;
    })()

    }

    checkPublisherFields(name){
        if(name != null){
            let checkName = this.validator.check_MultipleWordsOnlyAlphaNumberic(name);
            if(!checkName){
                throw new Error('Must supply name');
            }
        }else{
            throw new Error('Must supply name');
        }
        return true;
    }

    async addPublisher(name){
        try{
            this.checkPublisherFields(name);

            let sql = `INSERT INTO publisher (name)
                VALUES(
                    "${name}"
                )`;
            const result = await this.db.run(sql);
            return result.lastID;
        }catch(e){
            throw e;
        }

    } 

    async getPublisherByID(ID){
        try{
            if(ID == null || isNaN(ID)){
                throw new Error('Must supply ID');
            }

            let sql = `SELECT count(ID) AS count FROM publisher WHERE ID = ${ID};`
            let records = await this.db.get(sql)
			if(records.count == 0){
                throw new Error(`Publisher not found`);
            }

            sql = `SELECT * FROM publisher WHERE ID = ${ID};`;

            records = await this.db.get(sql);
            return records;

        }catch(e){
            throw e;
        }
    }

    async deletePublisherByID(ID){
        try{
            if(ID == null || isNaN(ID)){
                throw new Error('Must supply ID');
            }

            let sql = [`
            DELETE FROM game_publisher
            WHERE publisherID = ${ID};
            `,`
            DELETE FROM publisher
            WHERE ID = ${ID}`
            ];

            for(let i = 0; i < sql.length; i++){
                await this.db.run(sql[i]);
            }

            return true;
        }catch(e){
            throw e;
        }
    }

}