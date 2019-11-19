
'use strict'

const Accounts = require('../modules/user.js')
const mime = require('mime-types')
const mock = require('mock-fs');
const fs = require('fs');

describe('getUserbyID()', () => {
    test('Get valid User', async done =>{
        expect.assertions(1);

        const user = await new Accounts();
        const titleToTest = "Red";
        const summary = "A simple summary";
        const desc = "Lorem Ipsum and as such this is a game";

        const userID = await user.register("Aaron", "passwordIsNotGood")
        
        const retreiveUser = await user.getUserByID(userID);

        expect(retreiveUser).toMatchObject(
            {
                ID: 1,
                username: "Aaron"
            }
        );

        done();
    })

    test('Error if user does not exist', async done =>{
        expect.assertions(1);
        const user = await new Accounts();
        
        await expect(user.getUserByID(0))
            .rejects.toEqual(Error('User not found'));
        done();
    })
    
    test('Error if userID is null', async done =>{
        expect.assertions(1);
        const user = await new Accounts();
        await expect(user.getUserByID(null))
            .rejects.toEqual(Error("Must supply userID"));


        done();
    })

    test('Error if userID is NaN', async done =>{
        expect.assertions(1);
        const user = await new Accounts();
        await expect(user.getUserByID("string"))
            .rejects.toEqual(Error("Must supply userID"));


        done();
    })

})


describe('uploadPicture()', ()=>{
    beforeEach(function() {
        //console.log("");
        mock({
            public: {
                game:{

                }
                
            },
            'user/images/pictureUpload.png':  Buffer.from([8, 6, 7, 5, 3, 0, 9])
        });
    });
    
    afterEach(mock.restore);
    
    test('Valid user', async done => {
        expect.assertions(2);

        const user = await new Accounts();

        const path = 'user/images/pictureUpload.png';
        const type = "image/png";
        const userID = await user.register(
            "Aaron",
            "notAGoodPassword");
        
        expect(await user.uploadPicture(path,type,userID)).toBe(true);
        const extension = await mime.extension(type);

        expect( await fs.existsSync(`public/users/${userID}/profile.${extension}`)).toBe(true);
        
        done();
    })

    test('Error if user does not exist', async done => {
        expect.assertions(1);

        const user = await new Accounts();

        const path = 'user/images/pictureUpload.png';
        const type = ".png";

        const userID = 2;
        
        await expect(user.uploadPicture(path,type,userID))
            .rejects.toEqual(Error('User not found'));
        done();
    })

    test('Error if userID is null', async done => {
        expect.assertions(1);

        const user = await new Accounts();

        const path = 'user/images/pictureUpload.png';
        const type = ".png";
        
        await expect(user.uploadPicture(path,type,null))
            .rejects.toEqual(Error('Must supply userID'));
        done();
    })

    test('Error if userID is NaN', async done => {
        expect.assertions(1);

        const user = await new Accounts();

        const path = 'user/images/pictureUpload.png';
        const type = ".png";
        
        await expect(user.uploadPicture(path,type,"Not a Number"))
            .rejects.toEqual(Error('Must supply userID'));
        done();
    })

    test('Error if path is null', async done => {
        expect.assertions(1);

        const user = await new Accounts();

        const path = 'user/images/pictureUpload.png';
        const type = ".png";
        
        await expect(user.uploadPicture(null,type,1))
            .rejects.toEqual(Error('Must supply path'));
        done();
    })

    test('Error if path is empty', async done => {
        expect.assertions(1);

        const user = await new Accounts();

        const path = 'user/images/pictureUpload.png';
        const type = ".png";
        
        await expect(user.uploadPicture('',type,1))
            .rejects.toEqual(Error('Must supply path'));
        done();
    })

    test('Error if type is null', async done => {
        expect.assertions(1);

        const user = await new Accounts();

        const path = 'user/images/pictureUpload.png';
        const type = ".png";
        
        await expect(user.uploadPicture(path,null,1))
            .rejects.toEqual(Error('Must supply type'));
        done();
    })

    test('Error if type is empty', async done => {
        expect.assertions(1);

        const user = await new Accounts();

        const path = 'user/images/pictureUpload.png';
        const type = ".png";
        
        await expect(user.uploadPicture(path,'',1))
            .rejects.toEqual(Error('Must supply type'));
        done();
    })
})

describe('register()', () => {

	test('register a valid account', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		const register = await account.register('doej', 'password')
		expect(register).toEqual(1)
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
		expect(valid).toEqual(1);
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
