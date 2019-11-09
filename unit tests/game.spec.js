
'use strict'

const Game = require('../modules/game');

describe('addNewGame()', ()=>{
    test('add a valid game', async done => {
        expect.assertions(1);
        try{
            const game = await new Game();
            const addNewGame = await game.addNewGame('Red', "A simple summary", "Lorem Ipsum and as such this is a game");
        }catch(e){
            
        }
        
        expect(addNewGame).toBe(true);
    
		done();
	})
	
})

describe('getGameByTitle()', ()=>{

})