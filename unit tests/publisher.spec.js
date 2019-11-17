
'use strict'

const Publishers = require('../modules/publisher.js');


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