'use strict'

const Category = require('../modules/category.js')

describe('addCategory()', () => {
	test('Valid category', async done => {
		expect.assertions(1)

		const category = await new Category()

		expect(await category.addCategory('Horror')).toBe(true)

		done()
	})

	test('Error if category null', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.addCategory(null))
			.rejects(Error('Must supply category'))

		done()
	})

	test('Error if category invalid', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.addCategory('~~@{}__)+'))
			.rejects(Error('Must supply category'))

		done()
	})
})
