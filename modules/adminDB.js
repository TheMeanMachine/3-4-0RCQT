
'use strict'

const sqlite = require('sqlite-async');
const mime = require('mime-types');
module.exports = class adminDB {
    constructor(dbName) {

        
        return (async() => {
			this.db = await sqlite.open(dbName);
			// we need this table to store the user accounts
            
            return this
        })()
    }

    async createTables(){
        try{
            console.log("Creating tables");
            
            const tablesSQL = [`
            CREATE TABLE IF NOT EXISTS user(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                pass TEXT,
                avatar TEXT,
                roleID INTEGER,
                FOREIGN KEY (roleID) REFERENCES role(ID)
            );`,`
    
            CREATE TABLE IF NOT EXISTS role(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT
            );`,`
    
            CREATE TABLE IF NOT EXISTS game(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                summary TEXT,
                desc TEXT
            );`,`
    
            CREATE TABLE IF NOT EXISTS gamePhoto(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                gameID INTEGER,
                picture TEXT,
                FOREIGN KEY (gameID) REFERENCES game(ID)
            );`,`
    
            CREATE TABLE IF NOT EXISTS game_category(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                gameID INTEGER,
                categoryID INTEGER,
                FOREIGN KEY (gameID) REFERENCES game(ID),
                FOREIGN KEY (categoryID) REFERENCES category(ID)
            );`,`
    
            CREATE TABLE IF NOT EXISTS category(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT
            );`,`
    
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
            );`,`
    
            CREATE TABLE IF NOT EXISTS reviewScreenshot(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                reviewID INTEGER,
                picture TEXT,
                FOREIGN KEY (reviewID) REFERENCES review(ID)
            );`,`
    
            CREATE TABLE IF NOT EXISTS review(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                gameID INTEGER,
                userID INTEGER,
                fullText,
                rating,
                flag,
                FOREIGN KEY (gameID) REFERENCES game(ID),
                FOREIGN KEY (userID) REFERENCES user(ID)
            );`,`
    
            CREATE TABLE IF NOT EXISTS comments(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                userID INTEGER,
                reviewID INTEGER,
                fullText,
                FOREIGN KEY (userID) REFERENCES user(ID),
                FOREIGN KEY (reviewID) REFERENCES review(ID)
            );`]
            
            for(let i = 0; i < tablesSQL.length; i++){
                await this.db.run(tablesSQL[i]);
            }
            
            console.log("DB Finished")
        } catch(err) {
            console.log(err);
            console.log("Unable to create tables or constraints");
			throw err
		}
        
        
    }
        
}