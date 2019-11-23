'use strict'

const Search = require('../modules/search.js')

describe('search', () => {
	test('Search with keyword in review', async done => {
		expect.assertions(1)

		const search = await new Search()
		const review = search.review
		const game = search.game

		game.addNewGame('Title', 'Summary', 'Description')

		review.addReview(1, {fullText: 'Hello', rating: 3}, 1)

		const result = search.search('hel')

		expect(result).toMatchObject({
			title: 'Title'
		})

		done()
	})

	test('Search with keyword in game', async done => {
		expect.assertions(1)

		const search = await new Search()

		const game = search.game

		await game.addNewGame('Title', 'Summary', 'Description')

		const result = await search.search('ummar')

		expect(result).toMatchObject({games: [
			{title: 'Title'}
		]
		})

		done()
	})

	test('Search with keyword in publisher', async done => {
		expect.assertions(1)

		const search = await new Search()
		const publisher = search.publisher
		const game = search.game

		game.addNewGame('Title', 'Summary', 'Description')

		publisher.addPublisher('Rocky')

		publisher.associateToPublisher(1, 1)

		const result = search.search('rock')

		expect(result).toMatchObject({
			title: 'Title'
		})

		done()
	})

	test('Search with keyword in category', async done => {
		expect.assertions(1)

		const search = await new Search()
		const category = search.category
		const game = search.game

		game.addNewGame('Title', 'Summary', 'Description')

		category.addCategory('Horror')

		category.associateToCategory(1, 1)

		const result = search.search('orr')

		expect(result).toMatchObject({
			title: 'Title'
		})

		done()
	})

	test('Search no results', async done => {
		expect.assertions(1)

		const search = await new Search()

		const result = search.search('orr')

		expect(result).toMatchObject()

		done()
	})
})
