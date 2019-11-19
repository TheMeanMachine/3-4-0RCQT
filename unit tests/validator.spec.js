
'use strict'

const valid = require('../modules/validator.js')

describe('checkMultipleWordsOnlyAlphaNumberic()', () => {
	test('Error if empty', () => {
		expect.assertions(1)
		const validator = new valid()
		const result = validator.checkMultipleWordsOnlyAlphaNumberic('')
		expect(result).toBe(false)
	})

	test('Single word', () => {
		expect.assertions(1)
		const validator = new valid()
		const result = validator.checkMultipleWordsOnlyAlphaNumberic('Red')
		expect(result).toBe(true)
	})

	test('Single word with numbers', () => {
		expect.assertions(1)
		const validator = new valid()
		const result = validator.checkMultipleWordsOnlyAlphaNumberic('Red2')
		expect(result).toBe(true)
	})

	test('Multiple words', () => {
		expect.assertions(1)
		const validator = new valid()
		const result = validator.checkMultipleWordsOnlyAlphaNumberic('Red Green Yellow Blue')
		expect(result).toBe(true)
	})

	test('Multiple words with numbers', () => {
		expect.assertions(1)
		const validator = new valid()
		const result = validator.checkMultipleWordsOnlyAlphaNumberic('Red Green Yellow Blue 763')
		expect(result).toBe(true)
	})

	test('Symbols', () => {
		expect.assertions(1)
		const validator = new valid()
		const result = validator.checkMultipleWordsOnlyAlphaNumberic(',.\'-')
		expect(result).toBe(true)
	})


})

