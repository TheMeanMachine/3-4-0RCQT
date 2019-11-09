
'use strict'

const valid = require('../modules/validator.js');

describe('check_MultipleWordsOnlyAlphaNumberic()', () => {
    test('Error if empty', () =>{
        let validator = new valid();
        let result = validator.check_MultipleWordsOnlyAlphaNumberic('');
        expect(result).toBe(false);
    })
    
    test('Single word', () =>{
        let validator = new valid();
        let result = validator.check_MultipleWordsOnlyAlphaNumberic('Red');
        expect(result).toBe(true);
    })

    test('Single word with numbers', () =>{
        let validator = new valid();
        let result = validator.check_MultipleWordsOnlyAlphaNumberic('Red2');
        expect(result).toBe(true);
    })

    test('Multiple words', () => {
        let validator = new valid();
        let result = validator.check_MultipleWordsOnlyAlphaNumberic('Red Green Yellow Blue');
        expect(result).toBe(true);
    })

    test('Multiple words with numbers', () => {
        let validator = new valid();
        let result = validator.check_MultipleWordsOnlyAlphaNumberic('Red Green Yellow Blue 763');
        expect(result).toBe(true);
    })

    test('Symbols', () => {
        let validator = new valid();
        let result = validator.check_MultipleWordsOnlyAlphaNumberic(`,.'-`);
        expect(result).toBe(true);
    })


})

