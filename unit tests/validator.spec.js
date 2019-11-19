
'use strict'

const valid = require('../modules/validator.js');

describe('check_MultipleWordsOnlyAlphaNumberic()', () => {
    test('Error if empty', () =>{
        expect.assertions(1);
        let validator = new valid();
        let result = validator.check_MultipleWordsOnlyAlphaNumberic('');
        expect(result).toBe(false);
    })
    
    test('Single word', () =>{
        expect.assertions(1);
        let validator = new valid();
        let result = validator.check_MultipleWordsOnlyAlphaNumberic('Red');
        expect(result).toBe(true);
    })

    test('Single word with numbers', () =>{
        expect.assertions(1);
        let validator = new valid();
        let result = validator.check_MultipleWordsOnlyAlphaNumberic('Red2');
        expect(result).toBe(true);
    })

    test('Multiple words', () => {
        expect.assertions(1);
        let validator = new valid();
        let result = validator.check_MultipleWordsOnlyAlphaNumberic('Red Green Yellow Blue');
        expect(result).toBe(true);
    })

    test('Multiple words with numbers', () => {
        expect.assertions(1);
        let validator = new valid();
        let result = validator.check_MultipleWordsOnlyAlphaNumberic('Red Green Yellow Blue 763');
        expect(result).toBe(true);
    })

    test('Symbols', () => {
        expect.assertions(1);
        let validator = new valid();
        let result = validator.check_MultipleWordsOnlyAlphaNumberic(`,.'-`);
        expect(result).toBe(true);
    })


})

