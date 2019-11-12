'use strict'
const sqlite = require('sqlite-async');
const Reviews = require('../modules/review.js');
const Games = require('../modules/game.js');


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

