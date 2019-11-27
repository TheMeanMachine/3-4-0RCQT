
'use strict'

const Games = require('../modules/game.js')
const Category = require('../modules/category.js')
const Publisher = require('../modules/publisher.js')

let category
let categorySpy
let categoryList = {categories: []}
let categoryGameAssoc = {assocs: []}
let publisher
let publisherSpy
let publisherList = {publishers: []}
let publisherGameAssoc = {assocs: []}

beforeEach(async() => {

	//Mock category
	categoryGameAssoc = {assocs: []}
	categoryList = {categories: []}
	category = await new Category()

	categorySpy = jest.spyOn(category, 'addCategory').mockImplementation((a) => {
		const newID = categoryList.categories.length+1
		categoryList.categories.push(
			{
				ID: newID,
				title: a,
			}
		)

		return newID
	})
	categorySpy = jest.spyOn(category, 'associateToCategory').mockImplementation((game, cat) => {
		categoryGameAssoc.assocs.push({
			catID: cat,
			gameID: game,
			ID: categoryGameAssoc.assocs.length +1
		})
	})
	categorySpy = jest.spyOn(Category.prototype, 'getGamesOfCategory').mockImplementation((ID) => {
		const result = {gameID: []}
		for(let i = 0; i < categoryGameAssoc.assocs.length; i++) {
			if(categoryGameAssoc.assocs[i].catID === ID) result.gameID.push(categoryGameAssoc.assocs[i].gameID)

		}
		return result
	})

	//Mock publisher
	publisherGameAssoc = {assocs: []}
	publisherList = {publishers: []}
	publisher = await new Publisher()

	publisherSpy = jest.spyOn(publisher, 'addPublisher').mockImplementation((a) => {
		const newID = publisherList.publishers.length+1
		publisherList.publishers.push(
			{
				ID: newID,
				name: a,
			}
		)

		return newID
	})
	publisherSpy = jest.spyOn(publisher, 'associateToPublisher').mockImplementation((game, pub) => {
		publisherGameAssoc.assocs.push({
			pubID: pub,
			gameID: game,
			ID: publisherGameAssoc.assocs.length +1
		})
	})
	publisherSpy = jest.spyOn(Publisher.prototype, 'getGamesOfPublisher').mockImplementation((ID) => {
		const result = {gameID: []}
		for(let i = 0; i < publisherGameAssoc.assocs.length; i++) {
			if(publisherGameAssoc.assocs[i].pubID === ID) result.gameID.push(publisherGameAssoc.assocs[i].gameID)

		}
		return result
	})
})

afterEach(async() => {
	categorySpy.mockRestore()
	publisherSpy.mockRestore()
})

describe('searchGame()', () => {
	test('Search with keyword in summary', async done => {
		expect.assertions(1)

		const game = await new Games()


		await game.addNewGame('Title', 'Summary', 'Description')

		const result = await game.searchGame('ummar')

		expect(result).toMatchObject({games: [
			{title: 'Title'}
		]
		})

		done()
	})

	test('Search with keyword in description', async done => {
		expect.assertions(1)

		const game = await new Games()


		await game.addNewGame('Title', 'Summary', 'Description')

		const result = await game.searchGame('esc')

		expect(result).toMatchObject({games: [
			{title: 'Title'}
		]
		})

		done()
	})

	test('Search with keyword in title', async done => {
		expect.assertions(1)

		const game = await new Games()


		await game.addNewGame('Title', 'Summary', 'Description')

		const result = await game.searchGame('itl')

		expect(result).toMatchObject({games: [
			{title: 'Title'}
		]
		})

		done()
	})

})

describe('getGamesOfCategory()', () => {
	test('Valid categoryID', async done => {
		expect.assertions(1)

		const game = await new Games()

		const catID = await category.addCategory('Horror')
		await category.addCategory('Cats')
		await category.addCategory('Comedy')
		await game.addNewGame('Green', 'Summary', 'Description')
		await game.addNewGame('Red', 'Summary', 'Description')
		const retGame = await game.getGameByTitle('Red')
		await category.associateToCategory(retGame.ID, catID)

		const result = await game.getGamesOfCategory(catID)

		expect(result).toMatchObject(
			{
				games: [
					{
						title: 'Red',
						summary: 'Summary',
						desc: 'Description'
					}
				]
			}
		)
		done()
	})


	test('Error if catID is null', async done => {
		expect.assertions(1)
		const game = await new Games()

		await expect(game.getGamesOfCategory(null))
			.rejects.toEqual(Error('Must supply catID'))
		done()
	})

	test('Error if catID is NaN', async done => {
		expect.assertions(1)

		const game = await new Games()


		await expect(game.getGamesOfCategory('not a number'))
			.rejects.toEqual(Error('Must supply catID'))
		done()
	})

	test('Error if catID is undefined', async done => {
		expect.assertions(1)

		const game = await new Games()


		await expect(game.getGamesOfCategory(undefined))
			.rejects.toEqual(Error('Must supply catID'))
		done()
	})
})


describe('getGamesOfPublisher()', () => {
	test('Valid ID', async done => {
		expect.assertions(1)

		const game = await new Games()

		const pubID = await publisher.addPublisher('Rockstar Games')
		await publisher.addPublisher('Pop Star Games')

		await game.addNewGame('Green', 'Summary', 'Description')
		await game.addNewGame('Red', 'Summary', 'Description')
		const retGame = await game.getGameByTitle('Red')
		await publisher.associateToPublisher(retGame.ID, pubID)

		const result = await game.getGamesOfPublisher(pubID)

		expect(result).toMatchObject(
			{
				games: [
					{
						title: 'Red',
						summary: 'Summary',
						desc: 'Description'
					}
				]
			}
		)
		done()
	})


	test('Error if pubID is null', async done => {
		expect.assertions(1)
		const game = await new Games()

		await expect(game.getGamesOfPublisher(null))
			.rejects.toEqual(Error('Must supply pubID'))
		done()
	})

	test('Error if pubID is NaN', async done => {
		expect.assertions(1)

		const game = await new Games()


		await expect(game.getGamesOfPublisher('not a number'))
			.rejects.toEqual(Error('Must supply pubID'))
		done()
	})

	test('Error if pubID is undefined', async done => {
		expect.assertions(1)

		const game = await new Games()


		await expect(game.getGamesOfPublisher(undefined))
			.rejects.toEqual(Error('Must supply pubID'))
		done()
	})
})

describe('game - review intergration', () => {
	test('Retrieve average rating ', async done => {
		expect.assertions(1)

		const game = await new Games()
		const review = game.review

		const titleToTest = 'Red'
		const summary = 'A simple summary'
		const desc = 'Lorem Ipsum and as such this is a game'

		await game.addNewGame(titleToTest, summary, desc)
		const retreiveGame = await game.getGameByTitle(titleToTest)
		await review.addReview(retreiveGame.ID, {fullText: 'sometext', rating: 4},1)
		await review.addReview(retreiveGame.ID, {fullText: 'sometext', rating: 1},1)
		await review.addReview(retreiveGame.ID, {fullText: 'sometext', rating: 3},1)
		const expectedAvg = (1 + 4 + 3) /3
		const averageRating = await review.getAverageRating(retreiveGame.ID)
		expect(averageRating).toEqual(expectedAvg)

		done()
	})
})

describe('checkGameFields()', () => {
	test('Valid fields', async done => {
		expect.assertions(1)
		const game = await new Games()
		const result = await game.checkGameFields('Red Jumper 4','Summary','Description')
		expect(result).toBe(true)
		done()
	})

	test('Error if empty _ title', async done => {
		expect.assertions(1)
		const game = await new Games()
		try{
			await game.checkGameFields('')
		}catch(e) {
			expect(e).toEqual(new Error('Must supply title'))
		}

		done()
	})

	test('Error if empty _ summary', async done => {
		expect.assertions(1)
		const game = await new Games()
		try{
			await game.checkGameFields('Red','')
		}catch(e) {
			expect(e).toEqual(new Error('Must supply summary'))
		}

		done()
	})

	test('Error if empty _ desc', async done => {
		expect.assertions(1)
		const game = await new Games()
		try{
			await game.checkGameFields('Red','Summary', '')
		}catch(e) {
			expect(e).toEqual(new Error('Must supply description'))
		}

		done()
	})

})


describe('deleteGameByID()', () => {
	test('Delete valid game', async done => {
		expect.assertions(2)

		const game = await new Games()

		await game.addNewGame(
			'title',
			'summary',
			'desc')
		const retreiveGame = await game.getGameByTitle('title')
		const deleteGame = await game.deleteGameByID(retreiveGame.ID)

		expect(deleteGame).toBe(true)

		await expect(game.getGameByTitle('title'))
			.rejects.toEqual(new Error('Game: "title" not found'))

		done()
	})

	test('Invalid nonexistant ID', async done => {
		expect.assertions(1)

		const game = await new Games()

		await expect(game.deleteGameByID(0))
			.rejects.toEqual(new Error('ID doesn\'t exist'))

		done()
	})

	test('Invalid string ID', async done => {
		expect.assertions(1)

		const game = await new Games()

		await expect(game.deleteGameByID('string'))
			.rejects.toEqual(new Error('Must supply ID'))

		done()
	})

	test('Invalid null ID', async done => {
		expect.assertions(1)

		const game = await new Games()

		await expect(game.deleteGameByID(null))
			.rejects.toEqual(new Error('Must supply ID'))

		done()
	})
})

describe('updateGameByID()', () => {
	test('Update valid game', async done => {
		expect.assertions(2)

		const game = await new Games()
		const title = 'Red'
		const summary = 'A simple summary'
		const desc = 'Lorem Ipsum and as such this is a game'

		const stringToUpdate = 'No way! 2'

		await game.addNewGame(title, summary, desc)
		const retreiveGame = await game.getGameByTitle(title)
		const updateGame = await game.updateGameByID(retreiveGame.ID,
			{title: stringToUpdate,
				summary: summary,
				desc: desc}
		)
		expect(updateGame).toBe(true)
		const retreiveUpdatedGame = await game.getGameByTitle(stringToUpdate)

		expect(retreiveUpdatedGame).toMatchObject(
			{
				ID: 1,
				title: stringToUpdate || '',
				summary: summary || '',
				desc: desc || ''
			}
		)

		done()
	})

	test('Error if duplicate title', async done => {
		expect.assertions(1)

		const game = await new Games()
		const title = 'Red'
		const summary = 'A simple summary'
		const desc = 'Lorem Ipsum and as such this is a game'

		const title2 = 'Red Floor'
		const summary2 = 'A game of Floors'
		const desc2 = 'Lorem Ipsum and as such this is a game'

		const stringToUpdate = 'Red Floor'

		await game.addNewGame(title, summary, desc)
		await game.addNewGame(title2, summary2, desc2)
		const retreiveGame = await game.getGameByTitle(title2)
		await expect( game.updateGameByID(retreiveGame.ID,
			{title: stringToUpdate,
				summary: summary,
				desc: desc}
		)).rejects.toEqual(Error(`Game: "${stringToUpdate}" already exists`))

		done()
	})

	test('Error if null ID', async done => {
		expect.assertions(1)

		const game = await new Games()

		await expect( game.updateGameByID(null,null))
			.rejects.toEqual(Error('Must supply ID'))

		done()
	})

	test('Error if NaN ID', async done => {
		expect.assertions(1)

		const game = await new Games()

		await expect( game.updateGameByID('string',null))
			.rejects.toEqual(Error('Must supply ID'))

		done()
	})
})

describe('getGameByTitle()', () => {
	test('Get valid game', async done => {
		expect.assertions(1)

		const game = await new Games()
		const titleToTest = 'Red'
		const summary = 'A simple summary'
		const desc = 'Lorem Ipsum and as such this is a game'

		await game.addNewGame(titleToTest, summary, desc)
		const retreiveGame = await game.getGameByTitle(titleToTest)

		expect(retreiveGame).toMatchObject(
			{
				ID: 1,
				title: titleToTest || '',
				summary: summary || '',
				desc: desc || ''
			}
		)

		done()
	})

	test('Error if game does not exist', async done => {
		expect.assertions(1)
		const game = await new Games()
		const title = 'Red'
		await expect(game.getGameByTitle(title))
			.rejects.toEqual(Error(`Game: "${title}" not found`))
		done()
	})

	test('Error if game is empty', async done => {
		expect.assertions(1)
		const game = await new Games()

		await expect(game.getGameByTitle(''))
			.rejects.toEqual(Error('Must supply a valid title'))


		done()
	})

})

describe('getGameByID()', () => {
	test('Get valid game', async done => {
		expect.assertions(1)

		const game = await new Games()
		const titleToTest = 'Red'
		const summary = 'A simple summary'
		const desc = 'Lorem Ipsum and as such this is a game'

		await game.addNewGame(titleToTest, summary, desc)
		const retreiveGameTitle = await game.getGameByTitle(titleToTest)
		const retreiveGame = await game.getGameByID(retreiveGameTitle.ID)

		expect(retreiveGame).toMatchObject(
			{
				ID: 1,
				title: titleToTest || '',
				summary: summary || '',
				desc: desc || ''
			}
		)

		done()
	})

	test('Error if ID is null', async done => {
		expect.assertions(1)
		const game = await new Games()
		await expect(game.getGameByID(null))
			.rejects.toEqual(Error('Must supply ID'))


		done()
	})

	test('Error if ID is NaN', async done => {
		expect.assertions(1)
		const game = await new Games()
		await expect(game.getGameByID('string'))
			.rejects.toEqual(Error('Must supply ID'))


		done()
	})

})


describe('getGames()', () => {
	test('Valid - retrieves 2 games', async done => {
		expect.assertions(1)

		const game = await new Games()

		const title = 'Red'
		const summary = 'Summary'
		const desc = 'Desc'
		await game.addNewGame(title, summary, desc)

		const title2 = 'Red2'
		const summary2 = 'Summary2'
		const desc2 = 'Desc2'
		await game.addNewGame(title2, summary2, desc2)

		expect(await game.getGames()).toMatchObject(
			{
				games: [
					{ID: 1,
						title: title,
						summary: summary,
						desc: desc
					},
					{ID: 2,
						title: title2,
						summary: summary2,
						desc: desc2
					}
				]
			}
		)

		done()
	})
})

describe('addNewGame()', () => {
	test('add a valid game', async done => {
		expect.assertions(1)

		const game = await new Games()
		const newGame = await game.addNewGame('Red', 'A simple summary', 'Lorem Ipsum and as such this is a game')
		expect(newGame).toBe(true)

		done()
	})

	test('add a duplicate game', async done => {
		expect.assertions(1)

		const game = await new Games()
		await game.addNewGame('Red', 'A simple summary', 'Lorem Ipsum and as such this is a game')
		await expect(game.addNewGame('Red', 'A simple summary', 'Lorem Ipsum and as such this is a game'))
			.rejects.toEqual(Error('Game "Red" already exists'))

		done()
	})

	test('error if title empty', async done => {
		expect.assertions(1)

		const game = await new Games()
		await expect(game.addNewGame('', 'Summary', 'Description'))
			.rejects.toEqual(Error('Must supply title'))

		done()
	})

	test('error if summary empty', async done => {
		expect.assertions(1)

		const game = await new Games()
		await expect(game.addNewGame('Title', '', 'Description'))
			.rejects.toEqual(Error('Must supply summary'))

		done()
	})

	test('error if description empty', async done => {
		expect.assertions(1)

		const game = await new Games()
		await expect(game.addNewGame('Title', 'Summary', ''))
			.rejects.toEqual(Error('Must supply description'))

		done()
	})
})

