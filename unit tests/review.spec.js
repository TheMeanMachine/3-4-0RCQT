'use strict'

const Reviews = require('../modules/review.js');
const Games = require('../modules/game.js');

describe('addReview()', ()=>{
    test('Valid review', async done =>{
        expect.assertions(2);

        const game = await new Games();

        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        const result = await addReview(retreiveGame.ID, "Full text", 4);

        expect(result).toBe(true);

        done();
    })

    test('Error if: Invalid review _ fullText empty', async done =>{
        expect.assertions(2);

        const game = await new Games();

        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await expect(addReview(retreiveGame.ID, "", 4))
            .rejects.toEqual(new Error('Must supply full text'));
        
        done();
    })

    test('Error if: Invalid review _ rating too high', async done =>{
        expect.assertions(2);

        const game = await new Games();

        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await expect(addReview(retreiveGame.ID, "Full text", 6))
            .rejects.toEqual(new Error('Rating must be 1-5'));
        
        done();
    })

    test('Error if: Invalid review _ rating too low', async done =>{
        expect.assertions(2);

        const game = await new Games();

        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await expect(addReview(retreiveGame.ID, "Full text", 0))
            .rejects.toEqual(new Error('Rating must be 1-5'));
        
        done();
    })

    test('Error if: Invalid review _ game does not exist', async done =>{
        expect.assertions(2);

        const game = await new Games();

        await game.addNewGame("title", "summary", "desc");
        const retreiveGame = await game.getGameByTitle("title");
        await expect(addReview(retreiveGame.ID, "Full text", 3))
            .rejects.toEqual(new Error('Game "title" does not exist'));
        
        done();
    })

})