'use strict'

const Category = require('../modules/category.js')

describe('associateToCategory', () => {
	test('Valid gameID and categoryID', async done => {
		expect.assertions(1)

		const category = await new Category()
		const game = category.game

		const catID = await category.addCategory('Horror')

		await game.addNewGame('Red', 'Summary', 'Description')
		const retGame = await game.getGameByTitle('Red')

		expect(await category.associateToCategory(retGame.ID, catID))
			.toBe(true)

		done()
	})

	test('Error if game does not exist', async done => {
		expect.assertions(1)

		const category = await new Category()

		const catID = await category.addCategory('Horror')

		await expect( category.associateToCategory(1, catID))
			.rejects.toEqual(Error('Game not found'))

		done()
	})

	test('Error if category does not exist', async done => {
		expect.assertions(1)

		const category = await new Category()
		const game = category.game

		await game.addNewGame('Red', 'Summary', 'Description')
		const retGame = await game.getGameByTitle('Red')

		await expect( category.associateToCategory(retGame.ID, 1))
			.rejects.toEqual(Error('Category not found'))

		done()
	})

	test('Error if gameID null', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.associateToCategory(null, 1))
			.rejects.toEqual(Error('Must supply gameID'))

		done()
	})

	test('Error if gameID NaN', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.associateToCategory('not a number', 1))
			.rejects.toEqual(Error('Must supply gameID'))

		done()
	})

	test('Error if categoryID null', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.associateToCategory(1, null))
			.rejects.toEqual(Error('Must supply categoryID'))

		done()
	})

	test('Error if categoryID NaN', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.associateToCategory(1, 'not a number'))
			.rejects.toEqual(Error('Must supply categoryID'))

		done()
	})
})

describe('getCategories()', () => {
	test('Valid game ID', async done => {
		expect.assertions(1)

		const category = await new Category()
		const game = category.game

		const catID1 = await category.addCategory('Cats')
		const catID2 = await category.addCategory('Runner')

		await game.addNewGame('Red', 'Summary', 'Description')
		const retGame = await game.getGameByTitle('Red')

		await category.associateToCategory(retGame.ID, catID1)
		await category.associateToCategory(retGame.ID, catID2)
		expect(await category.getCategories(retGame.ID))
			.toMatchObject({
				categories: [
					{
						ID: catID1,
						title: 'Cats'
					},
					{
						ID: catID2,
						title: 'Runner'
					}
				]
			})
		done()
	})

	test('Error if gameID is null', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect(category.getCategories(null))
			.rejects.toEqual(Error('Must supply gameID'))
		done()
	})

	test('Error if gameID is NaN', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect(category.getCategories('Not a number'))
			.rejects.toEqual(Error('Must supply gameID'))
		done()
	})

	test('Error if gameID is undefined', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect(category.getCategories(undefined))
			.rejects.toEqual(Error('Must supply gameID'))
		done()
	})

	test('Error if game does not exist', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect(category.getCategories(1))
			.rejects.toEqual(Error('Game not found'))
		done()
	})

})

describe('addCategory()', () => {
	test('Valid name', async done => {
		expect.assertions(1)

		const category = await new Category()

		expect(await category.addCategory('Horror')).toBe(1)

		done()
	})

	test('Error if category null', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.addCategory(null))
			.rejects.toEqual(Error('Must supply name'))
		done()
	})

	test('Error if duplicate', async done => {
		expect.assertions(1)

		const category = await new Category()
		await category.addCategory('Horror')

		await expect(category.addCategory('Horror'))
			.rejects.toEqual(Error('Category already exists'))

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

describe('getCategoryByID()', () => {
	test('Valid ID', async done => {
		expect.assertions(1)

		const category = await new Category()
		const catID = await category.addCategory('Run')

		expect(await category.getCategoryByID(catID)).toMatchObject(
			{
				ID: 1,
				title: 'Run'
			}
		)

		done()
	})

	test('Error if category does not exist', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.getCategoryByID(2))
			.rejects.toEqual(Error('Category not found'))

		done()
	})

	test('Error if catID is null', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.getCategoryByID(null))
			.rejects.toEqual(Error('Must supply catID'))

		done()
	})

	test('Error if catID is NaN', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.getCategoryByID('Not a number'))
			.rejects.toEqual(Error('Must supply catID'))

		done()
	})
})

describe('deleteByID()', () => {
	test('Valid catID', async done => {
		expect.assertions(1)

		const category = await new Category()
		const catID = await category.addCategory('Run')
		expect(await category.deleteByID(catID)).toBe(true)

		done()
	})

	test('Error if catID is null', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect(category.deleteByID(null))
			.rejects.toEqual(Error('Must supply catID'))

		done()
	})

	test('Error if catID is NaN', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect(category.deleteByID('Not a number'))
			.rejects.toEqual(Error('Must supply catID'))

		done()
	})
})
