'use strict'

const Category = require('../modules/category.js')

const Games = require('../modules/game')

let game
let gameSpy
let gamesList = {games: []}

beforeEach(async() => {

	//Mock Games
	gamesList = {games: []}
	game = await new Games()
	gamesList.games.push()

	gameSpy = jest.spyOn(game, 'addNewGame').mockImplementation((a,b,c) => {
		gamesList.games.push(
			{
				ID: gamesList.games.length+1,
				title: a,
				summary: b,
				desc: c
			}
		)

		return true
	})
	gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation((title) => {
		for(let i = 0; i < gamesList.games.length; i++) {
			if(gamesList.games[i].title === title) return gamesList.games[i]

		}
	})
	gameSpy = jest.spyOn(Games.prototype, 'getGameByID').mockImplementation((ID) => {
		for(let i = 0; i < gamesList.games.length; i++) {
			if(gamesList.games[i].ID === ID) return gamesList.games[i]

		}
	})
})

afterAll(async() => {
	gameSpy.mockRestore()
})

describe('game - category intergration', () => {

	test('New games, adding into game_category', async done => {
		expect.assertions(1)

		const category = await new Category()

		const catID = await category.addCategory('Runner')

		await game.addNewGame('Green', 'Summary', 'Description')
		await game.addNewGame('Red', 'Summary', 'Description')
		const retGame = await game.getGameByTitle('Red')

		await category.associateToCategory(retGame.ID, catID)

		const result = await category.getGamesOfCategory(catID)
		expect(result).toMatchObject(
			{
				gameID: [2]
			}
		)
		done()
	})

	test('New games, removing into game_category', async done => {
		expect.assertions(1)

		const category = await new Category()


		const catID = await category.addCategory('Horror')

		await game.addNewGame('Red', 'Summary', 'Description')
		const retGame = await game.getGameByTitle('Red')

		await category.associateToCategory(retGame.ID, catID)

		const result = await category.unassociateToCategory(retGame.ID, catID)

		expect(result)
			.toBe(true)

		done()
	})

})

describe('searchCategories()', () => {
	test('Valid category', async done => {
		expect.assertions(1)

		const category = await new Category()

		await category.addCategory('Comedy')
		await category.addCategory('Horror')
		await category.addCategory('Needy')

		const result = await category.searchCategories('edy')

		expect(result).toMatchObject({
			categories: [
				{title: 'Comedy'},
				{title: 'Needy'}
			]
		})

		done()
	})
})


describe('getAllCategories()', () => {
	test('Gets all categories', async done => {
		expect.assertions(1)

		const category = await new Category()

		await category.addCategory('Comedy')
		await category.addCategory('Horror')
		await category.addCategory('Cats')

		const allCategories = await category.getAllCategories()

		expect(allCategories).toMatchObject({
			categories: [
				{title: 'Comedy'},
				{title: 'Horror'},
				{title: 'Cats'}
			]
		})

		done()
	})
})

describe('getGamesOfCategory()', () => {
	test('Valid categoryID', async done => {
		expect.assertions(1)

		const category = await new Category()


		const catID = await category.addCategory('Horror')
		await category.addCategory('Cats')
		await category.addCategory('Comedy')
		await game.addNewGame('Green', 'Summary', 'Description')
		await game.addNewGame('Red', 'Summary', 'Description')
		const retGame = await game.getGameByTitle('Red')
		await category.associateToCategory(retGame.ID, catID)

		const result = await category.getGamesOfCategory(catID)

		expect(result).toMatchObject(
			{
				gameID: [2]
			}
		)
		done()
	})


	test('Error if catID is null', async done => {
		expect.assertions(1)

		const category = await new Category()


		await expect(category.getGamesOfCategory(null))
			.rejects.toEqual(Error('Must supply catID'))
		done()
	})

	test('Error if catID is NaN', async done => {
		expect.assertions(1)

		const category = await new Category()


		await expect(category.getGamesOfCategory('not a number'))
			.rejects.toEqual(Error('Must supply catID'))
		done()
	})

	test('Error if catID is undefined', async done => {
		expect.assertions(1)

		const category = await new Category()


		await expect(category.getGamesOfCategory(undefined))
			.rejects.toEqual(Error('Must supply catID'))
		done()
	})
})

describe('getOtherCategories()', () => {
	test('Valid gameID', async done => {
		expect.assertions(1)

		const category = await new Category()


		const catID = await category.addCategory('Horror')
		await category.addCategory('Cats')
		await category.addCategory('Comedy')
		await game.addNewGame('Red', 'Summary', 'Description')
		const retGame = await game.getGameByTitle('Red')
		await category.associateToCategory(retGame.ID, catID)

		const result = await category.getOtherCategories(retGame.ID)

		expect(result).toMatchObject(
			{
				categories: [
					{title: 'Cats'},
					{title: 'Comedy'}
				]}
		)

		done()
	})
})

describe('unassociateToCategory', () => {
	test('Valid gameID and categoryID', async done => {
		expect.assertions(1)

		const category = await new Category()


		const catID = await category.addCategory('Horror')

		await game.addNewGame('Red', 'Summary', 'Description')
		const retGame = await game.getGameByTitle('Red')

		await category.associateToCategory(retGame.ID, catID)

		const result = await category.unassociateToCategory(retGame.ID, catID)

		expect(result)
			.toBe(true)

		done()
	})

	test('Error if gameID null', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.unassociateToCategory(null, 1))
			.rejects.toEqual(Error('Must supply gameID'))

		done()
	})

	test('Error if gameID NaN', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.unassociateToCategory('not a number', 1))
			.rejects.toEqual(Error('Must supply gameID'))

		done()
	})

	test('Error if categoryID null', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.unassociateToCategory(1, null))
			.rejects.toEqual(Error('Must supply categoryID'))

		done()
	})

	test('Error if categoryID NaN', async done => {
		expect.assertions(1)

		const category = await new Category()

		await expect( category.unassociateToCategory(1, 'not a number'))
			.rejects.toEqual(Error('Must supply categoryID'))

		done()
	})
})

describe('associateToCategory', () => {
	test('Valid gameID and categoryID', async done => {
		expect.assertions(1)

		const category = await new Category()


		const catID = await category.addCategory('Horror')

		await game.addNewGame('Red', 'Summary', 'Description')
		const retGame = await game.getGameByTitle('Red')

		expect(await category.associateToCategory(retGame.ID, catID))
			.toBe(true)

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
