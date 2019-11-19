'use strict'

const Category = require('../modules/category.js')

describe('addCategory()', () => {
	test('Valid name', async done => {
		expect.assertions(1)

		const category = await new Category()

		expect(await category.addCategory('Horror')).toBe(1)

		done()
	})

	test('Error if name null', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect(category.addCategory(null))
			.rejects.toEqual(Error('Must supply name'))

		done()
	})

	test('Error if name invalid', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.addCategory('~~@{}__)+'))
			.rejects.toEqual(Error('Must supply name'))

		done()
	})
})
