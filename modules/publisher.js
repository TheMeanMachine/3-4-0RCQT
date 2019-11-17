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
            name TITLE
        );`
        ];
        for(let i = 0; i < sql.length; i++){
            await this.db.run(sql[i]);
        }
        
        return this;
    })()

    }

    

}