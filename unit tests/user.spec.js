
'use strict'

const Accounts = require('../modules/user.js')


describe('register()', () => {

	test('register a valid account', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		const register = await account.register('doej', 'password')
		expect(register).toBe(true)
		done()
	})

	test('register a duplicate username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password')
		await expect( account.register('doej', 'password') )
			.rejects.toEqual( Error('username "doej" already in use') )
		done()
	})

	test('error if blank username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect( account.register('', 'password') )
			.rejects.toEqual( Error('Must supply user') )
		done()
	})

	test('error if blank password', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect( account.register('doej', '') )
			.rejects.toEqual( Error('Must supply pass') )
		done()
	})

})

describe('checkUserFields()', ()=>{
    test('Valid fields', async done => {
        expect.assertions(1);
        const game = await new Accounts();
        let result = await game.checkUserFields('Username','Password');
        expect(result).toBe(true);
        done();
    })

    test('Error if empty _ username', async done =>{
        expect.assertions(1);
		const game = await new Accounts();
        try{
            await game.checkUserFields('');
        }catch(e){
            expect(e).toEqual(new Error('Must supply user'));
        }
        
        done();
    })

    test('Error if empty _ summary', async done =>{
        expect.assertions(1);
		const game = await new Accounts();
        try{
            await game.checkUserFields('Username','');
        }catch(e){
            expect(e).toEqual(new Error('Must supply pass'));
        }
        
        done();
    })

})

describe('uploadPicture()', () => {
	// this would have to be done by mocking the file system
	// perhaps using mock-fs?
})

describe('login()', () => {
	test('log in with valid credentials', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password')
		const valid = await account.login('doej', 'password')
		expect(valid).toBe(true)
		done()
	})

	test('invalid username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password')
		await expect( account.login('roej', 'password') )
			.rejects.toEqual( Error('username "roej" not found') )
		done()
	})

	test('invalid password', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password')
		await expect( account.login('doej', 'bad') )
			.rejects.toEqual( Error('invalid password for account "doej"') )
		done()
	})

})
