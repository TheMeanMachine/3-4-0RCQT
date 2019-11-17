
'use strict'

const Publishers = require('../modules/publisher.js');

describe('deletePublisherByID()', ()=>{
    test('Valid publisher', async done =>{
        expect.assertions(2);

        const publisher = await new Publishers();

        const id = await publisher.addPublisher("Rockstar Games");
        
        const result = await publisher.deletePublisherByID(id);
        expect(result).toBe(true);
        await expect(publisher.deletePublisherByID(1))
            .rejects.toEqual(Error('Publisher not found'));
            

        done();
    })

    test('Error if ID is null', async done =>{
        expect.assertions(1);

        const publisher = await new Publishers();

        const id = await publisher.addPublisher("Rockstar Games");
        
        await expect(publisher.deletePublisherByID(null))
            .rejects.toEqual(Error('Must supply ID'));

        done();
    })
    test('Error if ID is NaN', async done =>{
        expect.assertions(1);

        const publisher = await new Publishers();

        
        await expect(publisher.deletePublisherByID("Not a number"))
            .rejects.toEqual(Error('Must supply ID'));
            
        done();
    })
})

describe('getPublisherByID()', ()=>{
    test('Valid publisher', async done =>{
        expect.assertions(1);

        const publisher = await new Publishers();

        const id = await publisher.addPublisher("Rockstar Games");
        
        const result = await publisher.getPublisherByID(id);

        expect(result).toMatchObject(
            {
                ID: id,
                name: "Rockstar Games"
            }
        );

        done();
    })

    test('Error if ID is null', async done =>{
        expect.assertions(1);

        const publisher = await new Publishers();

        const id = await publisher.addPublisher("Rockstar Games");
        
        await expect(publisher.getPublisherByID(null))
            .rejects.toEqual(Error('Must supply ID'));

        done();
    })

    test('Error if publisher does not exist', async done =>{
        expect.assertions(1);

        const publisher = await new Publishers();

        await expect(publisher.getPublisherByID(1))
            .rejects.toEqual(Error('Publisher not found'));
            
        done();
    })

    test('Error if ID is NaN', async done =>{
        expect.assertions(1);

        const publisher = await new Publishers();

        
        await expect(publisher.getPublisherByID("Not a number"))
            .rejects.toEqual(Error('Must supply ID'));
            
        done();
    })
})

describe('addPublisher()', ()=>{
    test('Valid publisher', async done =>{
        expect.assertions(1);
        
        const publisher = await new Publishers();

        const result = await publisher.addPublisher("Rockstar Games");
        expect(result).toEqual(1);//Returns ID of publisher

        done();
    })

    test('Error if invalid publisher', async done =>{
        expect.assertions(1);
        
        const publisher = await new Publishers();

        await expect(publisher.addPublisher(""))
            .rejects.toEqual(Error('Must supply name'));


        done();
    })

    
})



describe('checkPublisherFields()', ()=>{
    test('Valid name', async done =>{
        expect.assertions(1);

        const publisher = await new Publishers();

        expect(
            publisher.checkPublisherFields('Rockstar Games')
            ).toBe(true);
        done();
    })

    test('Error if: invalid name', async done =>{
        expect.assertions(1);

        const publisher = await new Publishers();

        try{
            publisher.checkPublisherFields('R%(*""@#');
        }catch(e){
            expect(e).toEqual(Error('Must supply name'))
        }
        done();
    })

    test('Error if: empty name', async done =>{
        expect.assertions(1);

        const publisher = await new Publishers();

        try{
            publisher.checkPublisherFields('');
        }catch(e){
            expect(e).toEqual(Error('Must supply name'))
        }
        done();
    })

    test('Error if: null name', async done =>{
        expect.assertions(1);

        const publisher = await new Publishers();

        try{
            publisher.checkPublisherFields(null);
        }catch(e){
            expect(e).toEqual(Error('Must supply name'))
        }
        done();
    })
})