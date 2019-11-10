
'use strict'

const Games = require('../modules/game.js');


describe('updateGameByID()', () => {
    test('Update valid game _ title', async done =>{
        expect.assertions(2);

        const game = await new Games();
        const titleToTest = "Red";
        const summary = "A simple summary";
        const desc = "Lorem Ipsum and as such this is a game";

        const titleToUpdate = "No way! 2";

        const newGame = await game.addNewGame(titleToTest, summary, desc);
        const retreiveGame = await game.getGameByTitle(titleToTest);
        const updateGame = await game.updateGameByID(retreiveGame.ID,
            {title: titleToUpdate}
            );
        expect(updateGame).toBe(true);
        const retreiveUpdatedGame = await game.getGameByTitle(titleToUpdate);

        expect(retreiveUpdatedGame).toMatchObject(
            {
                ID: 1,
                title: titleToUpdate || '',
                summary: summary || '',
                desc: desc || ''
            }
        );

        done();
    })
})

describe('getGameByTitle()', () => {
    test('Get valid game', async done =>{
        expect.assertions(1);

        const game = await new Games();
        const titleToTest = "Red";
        const summary = "A simple summary";
        const desc = "Lorem Ipsum and as such this is a game";

        const newGame = await game.addNewGame(titleToTest, summary, desc);
        const retreiveGame = await game.getGameByTitle(titleToTest);

        expect(retreiveGame).toMatchObject(
            {
                ID: 1,
                title: titleToTest || '',
                summary: summary || '',
                desc: desc || ''
            }
        );

        done();
    })

    test('Error if game does not exist', async done =>{
        expect.assertions(1);
        const game = await new Games();
        const title = "Red";
        await expect(game.getGameByTitle(title))
            .rejects.toEqual(Error('Game: "'+title+'" not found'));
        done();
    })
    
    test('Error if game is empty', async done =>{
        expect.assertions(1);
        const game = await new Games();

        await expect(game.getGameByTitle(''))
            .rejects.toEqual(Error("Must supply a valid title"));


        done();
    })

})

describe('getGameByTitle()_returnObject', () => {
    test('setTitle() valid', async done=>{
        expect.assertions(1);

        const game = await new Games();

        const title = "Red";
        const summary = "A simple summary";
        const desc = "Lorem Ipsum and as such this is a game";

        const new_S = "A new title";

        const newGame = await game.addNewGame(title, summary, desc);
        let retreiveGame = await game.getGameByTitle(title);
        
        let re = retreiveGame.setTitle(new_S);
        
        expect(retreiveGame).toMatchObject(
            {
                title: new_S,
            }
        );

        done();
    })

    test('setTitle() empty', async done=>{
        expect.assertions(1);

        const game = await new Games();

        const title = "Red";
        const summary = "A simple summary";
        const desc = "Lorem Ipsum and as such this is a game";

        const newGame = await game.addNewGame(title, summary, desc);
        let retreiveGame = await game.getGameByTitle(title);
        
        try{
            retreiveGame.setTitle("");
        }catch(e){
            expect(e.message).toBe("Must supply title");
        }
        done();
    })
    

    test('setSummary() valid', async done=>{
        expect.assertions(1);

        const game = await new Games();

        const title = "Red";
        const summary = "A simple summary";
        const desc = "Lorem Ipsum and as such this is a game";

        const new_S = "A new summary";

        const newGame = await game.addNewGame(title, summary, desc);
        let retreiveGame = await game.getGameByTitle(title);
        
        let re = retreiveGame.setSummary(new_S);
        
        expect(retreiveGame).toMatchObject(
            {
                summary: new_S,
            }
        );

        done();
    })

    test('setSummary() empty', async done=>{
        expect.assertions(1);

        const game = await new Games();

        const title = "Red";
        const summary = "A simple summary";
        const desc = "Lorem Ipsum and as such this is a game";

        const newGame = await game.addNewGame(title, summary, desc);
        let retreiveGame = await game.getGameByTitle(title);
        
        try{
            retreiveGame.setSummary("");
        }catch(e){
            expect(e.message).toBe("Must supply summary");
        }
        done();
    })

    test('setDesc() valid', async done=>{
        expect.assertions(1);

        const game = await new Games();

        const title = "Red";
        const summary = "A simple summary";
        const desc = "Lorem Ipsum and as such this is a game";

        const new_S = "A new description";

        const newGame = await game.addNewGame(title, summary, desc);
        let retreiveGame = await game.getGameByTitle(title);
        
        let re = retreiveGame.setDesc(new_S);
        
        expect(retreiveGame).toMatchObject(
            {
                desc: new_S,
            }
        );

        done();
    })

    test('setDesc() empty', async done=>{
        expect.assertions(1);

        const game = await new Games();

        const title = "Red";
        const summary = "A simple summary";
        const desc = "Lorem Ipsum and as such this is a game";

        const newGame = await game.addNewGame(title, summary, desc);
        let retreiveGame = await game.getGameByTitle(title);
        
        try{
            retreiveGame.setDesc("");
        }catch(e){
            expect(e.message).toBe("Must supply description");
        }
        done();
    })
})

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

