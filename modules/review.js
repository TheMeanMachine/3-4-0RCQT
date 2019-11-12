
'use string'

//Custom modules
const valid = require('./validator');
const sqlite = require('sqlite-async');

module.exports = class Review {
    constructor(dbName, router){
        this.validator = new valid();
        this.router = router;
		return (async() => {
            this.dbName = dbName || ':memory:';
			this.db = await sqlite.open(this.dbName);
            const sql = 
            [`
    
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
            );`]
            
            for(let i = 0; i < sql.length; i++){
                await this.db.run(sql[i]);
            }
			
			return this;
		})()
    }

    

    
    
}