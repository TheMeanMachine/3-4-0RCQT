
'use strict'

const Publishers = require('../modules/publisher');


describe('addPublisher()', ()=>{
    test('Valid publisher', async done =>{
        expect.assertions(1);
        
        const publisher = new Publishers();

        const result = await publisher.addPublisher("Rockstar Games");
        expect(result).toEqual(1);//Returns ID of publisher

        done();
    })

    test('Error if name is null', async done =>{
        expect.assertions(1);
        
        const publisher = new Publishers();

        await expect(publisher.addPublisher(null))
            .rejects.toEqual(Error('Must supply name'));

        done();
    })
})