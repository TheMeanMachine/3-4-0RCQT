'use strict'
const sqlite = require('sqlite-async');
const Reviews = require('../modules/review.js');
const Games = require('../modules/game.js');

describe('addReview()', ()=>{
    test('Valid review', async done =>{
        expect.assertions(1);

        
        const review = await new Reviews(null, db);
        const game = await new Games(null, db);

        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        const result = await review.addReview(retreiveGame.ID, "Full text", 4);

        expect(result).toBe(true);

        done();
    })

    test('Error if: Invalid review _ fullText empty', async done =>{
        expect.assertions(1);

        const game = await new Games();
        const review = await new Reviews();
        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await expect(review.addReview(retreiveGame.ID, "", 4))
            .rejects.toEqual(Error('Must supply fulltext'));
        
        done();
    })

    test('Error if: Invalid review _ rating too high', async done =>{
        expect.assertions(1);

        const game = await new Games();
        const review = await new Reviews();
        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await expect(review.addReview(retreiveGame.ID, "Full text", 6))
            .rejects.toEqual(Error('Rating must be 1-5'));
        
        done();
    })

    test('Error if: Invalid review _ rating too low', async done =>{
        expect.assertions(1);

        const game = await new Games();
        const review = await new Reviews();
        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await expect(review.addReview(retreiveGame.ID, "Full text", 0))
            .rejects.toEqual(Error('Rating must be 1-5'));
        
        done();
    })

    test('Error if: Invalid review _ game does not exist', async done =>{
        expect.assertions(1);
       
        const review = await new Reviews(null);
        const game = await new Games(null);
        await expect(review.addReview(0, "Full text", 3))
            .rejects.toEqual(Error('Game does not exist'));
        
        done();
    })

    test('Error if: Invalid review _ Review is NaN', async done =>{
        expect.assertions(1);
        const game = await new Games();
        const review = await new Reviews();
        await expect(review.addReview(0, "Full text", "string"))
            .rejects.toEqual(Error('Must supply rating'));
        
        done();
    })

    test('Error if: Invalid review _ ID is NaN', async done =>{
        expect.assertions(1);
        const game = await new Games();
        const review = await new Reviews();
        await expect(review.addReview("string", "Full text", 3))
            .rejects.toEqual(Error('Must supply gameID'));
        
        done();
    })

    test('Error if: Invalid review _ ID is null', async done =>{
        expect.assertions(1);
        const game = await new Games();
        const review = await new Reviews();
        await expect(review.addReview(null, "Full text", 3))
            .rejects.toEqual(Error('Must supply gameID'));
        
        done();
    })

})