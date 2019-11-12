
'use string'

const sqlite = require('sqlite-async');
//Custom modules
const valid = require('./validator');
const Games = require('./game');

module.exports = class Review {
    constructor(dbName){
        this.validator = new valid();
        
		return (async() => {
            
            this.dbName = dbName || ':memory:';
            this.db = await sqlite.open(this.dbName);
            this.games = await new Games();
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
                fullText TEXT,
                rating INTEGER,
                flag INTEGER,
                FOREIGN KEY (gameID) REFERENCES game(ID),
                FOREIGN KEY (userID) REFERENCES user(ID)
            );`]

            
            for(let i = 0; i < sql.length; i++){
                await this.db.run(sql[i]);
            }
			
			return this;
		})()
    }

    checkReviewFields(fullText, rating){
        if(fullText != null){
            let checkFullText = this.validator.check_MultipleWordsOnlyAlphaNumberic(fullText);
            if(!checkFullText){
                throw new Error('Must supply fulltext');
            }
        }
        if(rating != null){
            
            if(isNaN(rating)){
                throw new Error('Must supply rating')
            
            }
            let greater = rating > 0;
            let lesser = rating <= 5;
            if(!greater || !lesser){
                
                throw new Error('Rating must be 1-5');
            } 
        }

        return true;
    }
    

    async addReview(gameID, data, userID){
        const fullText = data.fullText || '';
        const rating = data.rating;
        try{
            
            if(gameID == null || isNaN(gameID)){
                throw new Error('Must supply gameID');
            }
            
            if(this.checkReviewFields(fullText, rating)){//Check input is sensible
                
                await this.games.getGameByID(gameID);//Checks if game exists
            }
            
            const sql = `
            INSERT INTO review (
                gameID,
                userID,
                fullText,
                rating,
                flag) VALUES (
                    ${gameID},
                    1,
                    "${fullText}",
                    ${rating},
                    0
                );`;

            let data = await this.db.run(sql);
            
            return data.lastID;
            
        }catch(e){
            throw e;
        }

        
    }

    async getReviewsByGameID(gameID){
        try{
            if(gameID == null || isNaN(gameID)){
                throw new Error('Must supply gameID');
            }
        
            await this.games.getGameByID(gameID);//Checks if game exists
            
            const sql = `
            SELECT * FROM review
            WHERE gameID = ${gameID}`;

            let data = await this.db.all(sql);

            let result = {reviews:[]};
            for(let i = 0; i < Object.keys(data).length; i++){
                result.reviews.push(data[i]);
            }
            console.log(result);
            return result;
        }catch(e){
            throw e;
        }

        
    }

    
}