
'use strict'

const Games = require('../modules/game.js');

describe('addNewGame()', () => {
    test('add a valid game', async done => {
        expect.assertions(1);
        
        const game = await new Games();
        const newGame = await game.addNewGame("Red", "A simple summary", "Lorem Ipsum and as such this is a game");
        expect(newGame).toBe(true);
    
		done();
    })
    
    test('add a duplicate game', async done =>{
        expect.assertions(1);
        
        const game = await new Games();
        await game.addNewGame("Red", "A simple summary", "Lorem Ipsum and as such this is a game");
        await expect(game.addNewGame("Red", "A simple summary", "Lorem Ipsum and as such this is a game"))
            .rejects.toEqual(Error('Game "Red" already exists'));
    
		done();
    })
    
    test('error if title empty', async done =>{
        expect.assertions(1);

        const game = await new Games();
        await expect(game.addNewGame('', 'Summary', 'Description'))
            .rejects.toEqual(Error('Must supply title'));

        done();
    })

    test('error if summary empty', async done =>{
        expect.assertions(1);

        const game = await new Games();
        await expect(game.addNewGame('Title', '', 'Description'))
            .rejects.toEqual(Error('Must supply summary'));

        done();
    })

    test('error if description empty', async done =>{
        expect.assertions(1);

        const game = await new Games();
        await expect(game.addNewGame('Title', 'Summary', ''))
            .rejects.toEqual(Error('Must supply description'));

        done();
    })
})

