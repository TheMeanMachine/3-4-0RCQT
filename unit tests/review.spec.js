'use strict'
const sqlite = require('sqlite-async');
const Reviews = require('../modules/review.js');
const Games = require('../modules/game.js');


describe('updateReview()', () => {
    test('Valid review update', async done => {
        expect.assertions(1);

        const review = await new Reviews();
        const game = await review.games;

        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await review.addReview(retreiveGame.ID, 
            {
            fullText: "fulltext",
            rating: 3
            }
        );

        const result = await updateReview(1, 
            {
                fullText: "THis is changed fulltext",
                rating: 4
            });

        result.toBe(true);

        done();
    })

    test('Valid review only fulltext', async done => {
        expect.assertions(1);

        const review = await new Reviews();
        const game = await review.games;

        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await review.addReview(retreiveGame.ID, 
            {
            fullText: "fulltext",
            rating: 3
            }
        );

        const result = await updateReview(1, 
            {
                fullText: "THis is changed fulltext"
            });

        result.toBe(true);

        done();
    })

    test('Valid review only rating', async done => {
        expect.assertions(1);

        const review = await new Reviews();
        const game = await review.games;

        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await review.addReview(retreiveGame.ID, 
            {
            fullText: "fulltext",
            rating: 3
            }
        );

        const result = await updateReview(1, 
            {
                rating: 4
            });

        result.toBe(true);

        done();
    })

    test('Error if review does not exist', async done => {
        expect.assertions(1);

        const review = await new Reviews();
        const game = await review.games;

        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await review.addReview(retreiveGame.ID, 
            {
            fullText: "fulltext",
            rating: 3
            }
        );

        await expect(result = updateReview(1, 
            {
                rating: 4
            })).rejects.toEqual(Error('Review not found'));


        done();
    })

    test('Error if reviewID is null', async done => {
        expect.assertions(1);

        const review = await new Reviews();

        await expect(result = updateReview(null, 
            {
                rating: 4
            })).rejects.toEqual(Error('Must supply reviewID'));


        done();
    })

    test('Error if reviewID is NaN', async done => {
        expect.assertions(1);

        const review = await new Reviews(); 

        await expect(result = updateReview("not a number", 
            {
                rating: 4
            })).rejects.toEqual(Error('Must supply reviewID'));


        done();
    })

    test('Error if all data is null', async done => {
        expect.assertions(1);

        const review = await new Reviews();
        await expect(result = updateReview(1)).rejects.toEqual(Error('Must supply reviewID'));

        done();
    })

    
})

describe('getReviewsByGameID()', ()=>{
    test('Valid game', async done =>{
        expect.assertions(1);

        const review = await new Reviews();
        const game = await review.games;

        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await review.addReview(retreiveGame.ID, 
            {
            fullText: "fulltext",
            rating: 3
            }
        );

        await review.addReview(retreiveGame.ID, 
            {
            fullText: "fulltext2",
            rating: 3
            }
        );
        
        const result = await review.getReviewsByGameID(retreiveGame.ID);


        expect(result).toMatchObject(
            { reviews:
                [ { ID: 1,
                    gameID: 1,
                    userID: 1,
                    fullText: 'fulltext',
                    rating: 3,
                    flag: 0 },
                  { ID: 2,
                    gameID: 1,
                    userID: 1,
                    fullText: 'fulltext2',
                    rating: 3,
                    flag: 0 } ] }
       
        );

        done();
    })

    test('Error if game does not exist', async done =>{
        expect.assertions(1);

        const review = await new Reviews();
        const game = await review.games;

        await expect(review.getReviewsByGameID(0, 
            {
            fullText: "fulltext",
            rating: 3
            })).rejects.toEqual(Error('Game not found'));
        
        done();
    })

    test('Error if gameID is NaN', async done =>{
        expect.assertions(1);

        const review = await new Reviews();
            
        await expect(review.getReviewsByGameID("string", 
            {
            fullText: "fulltext",
            rating: 3
            })).rejects.toEqual(Error('Must supply gameID'));
        
        done();
    })

    

    test('Error if gameID is null', async done =>{
        expect.assertions(1);
        const review = await new Reviews();
            
        await expect(review.getReviewsByGameID(null, 
            {
            fullText: "fulltext",
            rating: 3
            })).rejects.toEqual(Error('Must supply gameID'));
        
        done();
    })


})

describe('checkReviewFields()', () => {
    test('Valid input _ both fields', async done =>{
        expect.assertions(1);

        const review = await new Reviews();

        const result = await review.checkReviewFields("This is full text", 1);

        expect(result).toBe(true);

        done();
    })
    test('Valid input _ just full text', async done =>{
        expect.assertions(1);

        const review = await new Reviews();

        const result = await review.checkReviewFields("This is full text");

        expect(result).toBe(true);

        done();
    })

    test('Valid input _ just rating', async done =>{
        expect.assertions(1);

        const review = await new Reviews();

        const result = await review.checkReviewFields(null, 1);

        expect(result).toBe(true);

        done();
    })

    test('Error if full', async done =>{
        expect.assertions(1);

        const review = await new Reviews();
        try{
            await review.checkReviewFields(null, null);
        }catch(e){
            expect(e).toEqual(Error('All fields are null'));
        }

        done();
    })

    test('Error if fulltext is not valid', async done =>{
        expect.assertions(1);

        const review = await new Reviews();
        try{
            await review.checkReviewFields("($(*(!()_", null);
        }catch(e){
            expect(e).toEqual(Error('Must supply fulltext'));
        }

        done();
    })

    test('Error if rating is too low', async done =>{
        expect.assertions(1);

        const review = await new Reviews();
        try{
            await review.checkReviewFields("Fulltext", 0);
        }catch(e){
            expect(e).toEqual(Error('Rating must be 1-5'));
        }

        done();
    })

    test('Error if rating is too high', async done =>{
        expect.assertions(1);

        const review = await new Reviews();
        try{
            await review.checkReviewFields("Fulltext", 6);
        }catch(e){
            expect(e).toEqual(Error('Rating must be 1-5'));
        }

        done();
    })
});



describe('addReview()', ()=>{
    test('Valid review', async done =>{
        expect.assertions(2);

        const review = await new Reviews();
        const game = await review.games;

        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        const result = await review.addReview(retreiveGame.ID, 
            {
            fullText: "fulltext",
            rating: 3
            });
        expect(result).toBe(1);
        const getReview = await review.getReviewsByGameID(retreiveGame.ID);

        expect(getReview.reviews[0]).toEqual({
            ID: result,
            gameID: retreiveGame.ID,
            userID: 1,
            fullText: "fulltext",
            rating: 3,
            flag: 0
        })

        done();
    })

    test('Error if: Invalid review _ fullText empty', async done =>{
        expect.assertions(1);

        const review = await new Reviews();
        const game = await review.games;
        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await expect(review.addReview(retreiveGame.ID, 
            {
            fullText: "",
            rating: 3
            }))
            .rejects.toEqual(Error('Must supply fulltext'));
        
        done();
    })

    test('Error if: Invalid review _ rating too high', async done =>{
        expect.assertions(1);

        
        const review = await new Reviews();
        const game = await review.games;
        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await expect(review.addReview(retreiveGame.ID, 
            {
            fullText: "fulltext",
            rating: 6
            }))
            .rejects.toEqual(Error('Rating must be 1-5'));
        
        done();
    })

    test('Error if: Invalid review _ rating too low', async done =>{
        expect.assertions(1);

        const review = await new Reviews();
        const game = await review.games;
        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await expect(review.addReview(retreiveGame.ID, 
            {
            fullText: "fulltext",
            rating: 0
            }))
            .rejects.toEqual(Error('Rating must be 1-5'));
        
        done();
    })

    test('Error if: Invalid review _ game does not exist', async done =>{
        expect.assertions(1);
       
        const review = await new Reviews();
        const game = await review.games;
        await expect(review.addReview(0, 
            {
            fullText: "fulltext",
            rating: 3
            }))
            .rejects.toEqual(Error('Game not found'));
        
        done();
    })

    test('Error if: Invalid review _ Rating is NaN', async done =>{
        expect.assertions(1);
        const review = await new Reviews();
        const game = await review.games;
        await expect(review.addReview(0, 
            {
            fullText: "fulltext",
            rating: "string"
            }))
            .rejects.toEqual(Error('Must supply rating'));
        
        done();
    })

    test('Error if: Invalid review _ ID is NaN', async done =>{
        expect.assertions(1);
        const review = await new Reviews();
        await expect(review.addReview("string", 
            {
            fullText: "fulltext",
            rating: 3
            }))
            .rejects.toEqual(Error('Must supply gameID'));
        
        done();
    })

    test('Error if: Invalid review _ ID is null', async done =>{
        expect.assertions(1);
        const game = await new Games();
        const review = await new Reviews();
        await expect(review.addReview(null, 
            {
            fullText: "fulltext",
            rating: 3
            }))
            .rejects.toEqual(Error('Must supply gameID'));
        
        done();
    })



})

