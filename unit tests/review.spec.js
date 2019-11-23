'use strict'
const Reviews = require('../modules/review.js')
const Games = require('../modules/game.js')
const Users = require('../modules/user.js')
describe('getAverageRating()', () => {
	test('Valid gameID', async done => {
		expect.assertions(1)

		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))
		const userID = await user.register('Samson', 'Password')


		const retreiveGame = await game.getGameByTitle('title')

		const ratings = [2,1,5,3,3,2]
		let average = 0
		for(let i = 0; i < ratings.length; i++) {
			await review.addReview(retreiveGame.ID,
				{
					fullText: 'fulltext',
					rating: ratings[i]
				}, userID
			)
			average += ratings[i]
		}
		average = average / ratings.length

		expect(await review.getAverageRating(retreiveGame.ID)).toEqual(average)
		gameSpy.mockRestore()
		userSpy.mockRestore()
		done()
	})

	test('Error if gameID is null', async done => {
		expect.assertions(1)

		const review = await new Reviews()

		await expect( review.getAverageRating(null))
			.rejects.toEqual(Error('Must supply gameID'))

		done()
	})

	test('Error if gameID is NaN', async done => {
		expect.assertions(1)

		const review = await new Reviews()
		await expect( review.getAverageRating('Not a number'))
			.rejects.toEqual(Error('Must supply gameID'))

		done()
	})
})

describe('deleteReviewByID()', () => {
	test('Delete valid review', async done => {
		expect.assertions(2)

		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))

		const userID = await user.register('Username', 'Password')
		const retreiveGame = await game.getGameByTitle('title')

		const reviewID = await review.addReview(userID,{
			fullText: 'Full!',
			rating: 4
		}, retreiveGame.ID)
		const deleteReview = await review.deleteReviewByID(reviewID)
		const retreive = await review.getReviewsByGameID(retreiveGame.ID,true, 4)

		expect(retreive.count).toEqual(0)

		expect(deleteReview).toBe(true)
		gameSpy.mockRestore()
		userSpy.mockRestore()
		done()
	})

	test('Error if reviewID is null', async done => {
		expect.assertions(1)

		const review = await new Reviews()

		await expect(review.deleteReviewByID(null))
			.rejects.toEqual(new Error('Must supply reviewID'))

		done()
	})

	test('Error if reviewID is NaN', async done => {
		expect.assertions(1)

		const review = await new Reviews()

		await expect(review.deleteReviewByID('Not a number'))
			.rejects.toEqual(new Error('Must supply reviewID'))

		done()
	})

	test('Error if reviewID is undefined', async done => {
		expect.assertions(1)

		const review = await new Reviews()

		await expect(review.deleteReviewByID(undefined))
			.rejects.toEqual(new Error('Must supply reviewID'))

		done()
	})
})

describe('publishReview()', () => {
	test('Publish valid review', async done => {
		expect.assertions(2)

		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))

		const userID = await user.register('Samson', 'Password')
		const retreiveGame = await game.getGameByTitle('title')
		const reviewID = await review.addReview(retreiveGame.ID,
			{
				fullText: 'fulltext',
				rating: 3
			}, userID
		)

		const publishResult = await review.publishReview(reviewID, true)

		expect(await review.getReviewsByGameID(retreiveGame.ID, true, 4))
			.toMatchObject(
				{ reviews:
                [{
                	flag: 1
                }] }

			)

		expect(publishResult).toBe(true)

		gameSpy.mockRestore()
		userSpy.mockRestore()
		done()

	})

	test('Unpublish valid review', async done => {
		expect.assertions(2)

		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))

		const userID = await user.register('Samson', 'Password')
		const retreiveGame = await game.getGameByTitle('title')
		const reviewID = await review.addReview(retreiveGame.ID,
			{
				fullText: 'fulltext',
				rating: 3
			}, userID
		)

		const publishResult = await review.publishReview(reviewID, false)

		expect(await review.getReviewsByGameID(retreiveGame.ID,true, 4))
			.toMatchObject(
				{ reviews:
                [{
                	flag: 0
                }] }

			)

		expect(publishResult).toBe(true)

		gameSpy.mockRestore()
		userSpy.mockRestore()
		done()
	})
})

describe('updateReview()', () => {
	test('Valid review update', async done => {
		expect.assertions(2)

		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))
		const userID = await user.register('Samson', 'Password')

		const retreiveGame = await game.getGameByTitle('title')
		await review.addReview(retreiveGame.ID,
			{
				fullText: 'fulltext',
				rating: 3
			}, userID
		)
		const changed = {
			fullText: 'This is changed fulltext',
			rating: 4
		}
		const result = await review.updateReview(userID, retreiveGame.ID, changed)
		expect(result).toBe(true)

		expect(await review.getReviewsByGameID(retreiveGame.ID, true, 4)).toMatchObject(
			{ reviews:
                [changed] }

		)

		userSpy.mockRestore()
		gameSpy.mockRestore()
		done()
	})
	test('Error if review does not exist', async done => {
		expect.assertions(1)

		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))
		const retreiveGame = await game.getGameByTitle('title')
		const userID = await user.register('Tim', 'Burton')
		await review.addReview(retreiveGame.ID,
			{
				fullText: 'fulltext',
				rating: 3
			}, userID
		)

		await expect(review.updateReview(3,retreiveGame.ID,
			{
				rating: 4,
				fullText: 'Hello!'
			}))
			.rejects.toEqual(Error('Review not found'))
		gameSpy.mockRestore()
		userSpy.mockRestore()
		done()

	})

	test('Error if userID is null', async done => {
		expect.assertions(1)

		const review = await new Reviews()

		await expect(review.updateReview(null,1,
			{
				rating: 4
			})).rejects.toEqual(Error('Must supply userID'))


		done()
	})

	test('Error if userID is NaN', async done => {
		expect.assertions(1)

		const review = await new Reviews()

		await expect(review.updateReview('not a number',1,
			{
				rating: 4
			})).rejects.toEqual(Error('Must supply userID'))


		done()
	})

	test('Error if gameID is null', async done => {
		expect.assertions(1)

		const review = await new Reviews()

		await expect(review.updateReview(1,null,
			{
				rating: 4
			})).rejects.toEqual(Error('Must supply gameID'))


		done()
	})

	test('Error if gameID is NaN', async done => {
		expect.assertions(1)

		const review = await new Reviews()

		await expect(review.updateReview(1,'not a number',
			{
				rating: 4
			})).rejects.toEqual(Error('Must supply gameID'))


		done()
	})

	test('Error if fulltext is not valid', async done => {
		expect.assertions(1)

		const review = await new Reviews()

		await expect(review.updateReview(1,1,
			{
				rating: 4,
				fullText: '@;\';!'
			})).rejects.toEqual(Error('Must supply fulltext'))


		done()
	})
})

describe('getReviewsByGameID()', () => {
	test('Valid game', async done => {
		expect.assertions(1)

		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		let registered = 1
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => {
			registered++
			return registered
		})
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))


		const userID = await user.register('Samson', 'Password')
		const userID2 = await user.register('Namptopn', 'Password')

		const retreiveGame = await game.getGameByTitle('title')
		await review.addReview(retreiveGame.ID,
			{
				fullText: 'fulltext',
				rating: 3
			}, userID
		)

		await review.addReview(retreiveGame.ID,
			{
				fullText: 'fulltext2',
				rating: 3
			}, userID2
		)

		const result = await review.getReviewsByGameID(retreiveGame.ID, true, userID)


		expect(result).toMatchObject(
			{ reviews:
                [
                	{
                	userID: userID2,
                	fullText: 'fulltext2',
                	rating: 3,
                	flag: 0 }
                ],
			userReview: {
				userID: userID,
				fullText: 'fulltext',
				rating: 3,
				flag: 0 }
			}

		)
		gameSpy.mockRestore()
		userSpy.mockRestore()
		done()
	})

	test('Valid game not admin', async done => {
		expect.assertions(1)

		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		let registered = 1

		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => {
			registered++
			return registered
		})
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))

		const userID = await user.register('Samson', 'Password')
		const userID2 = await user.register('Namptopn', 'Password')

		const retreiveGame = await game.getGameByTitle('title')
		await review.addReview(retreiveGame.ID,
			{
				fullText: 'fulltext',
				rating: 3
			}, userID
		)

		await review.addReview(retreiveGame.ID,
			{
				fullText: 'fulltext2',
				rating: 3
			}, userID2
		)

		const result = await review.getReviewsByGameID(retreiveGame.ID, false, userID)


		expect(result).toMatchObject(
			{ reviews: [],
				count: 2

			}

		)
		gameSpy.mockRestore()
		userSpy.mockRestore()
		done()
	})

	test('Error if gameID is NaN', async done => {
		expect.assertions(1)

		const review = await new Reviews()

		await expect(review.getReviewsByGameID('string',
			{
				fullText: 'fulltext',
				rating: 3
			})).rejects.toEqual(Error('Must supply gameID'))

		done()
	})


	test('Error if gameID is null', async done => {
		expect.assertions(1)
		const review = await new Reviews()

		await expect(review.getReviewsByGameID(null,
			{
				fullText: 'fulltext',
				rating: 3
			})).rejects.toEqual(Error('Must supply gameID'))

		done()
	})


})

describe('checkRating()', () => {
	test('Valid input', async done => {
		expect.assertions(1)

		const review = await new Reviews()

		const result = await review.checkRating(1)

		expect(result).toBe(true)

		done()
	})


	test('Error if rating is too low', async done => {
		expect.assertions(1)

		const review = await new Reviews()
		try{
			await review.checkRating(0)
		}catch(e) {
			expect(e).toEqual(Error('Rating must be 1-5'))
		}

		done()
	})

	test('Error if rating is too high', async done => {
		expect.assertions(1)

		const review = await new Reviews()
		try{
			await review.checkRating(6)
		}catch(e) {
			expect(e).toEqual(Error('Rating must be 1-5'))
		}

		done()
	})
})

describe('addReview()', () => {
	test('Valid review', async done => {
		expect.assertions(1)

		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))

		const userID = await user.register('Samson', 'Password')

		const retreiveGame = await game.getGameByTitle('title')

		const result = await review.addReview(retreiveGame.ID,
			{
				fullText: 'fulltext',
				rating: 3
			}, userID)

		expect(result).toBe(1)

		userSpy.mockRestore()
		gameSpy.mockRestore()
		done()
	})

	test('Error if: Invalid review _ fullText empty', async done => {
		expect.assertions(1)

		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))
		const userID = await user.register('Samson', 'Password')

		const retreiveGame = await game.getGameByTitle('title')
		await expect(review.addReview(retreiveGame.ID,
			{
				fullText: '',
				rating: 3
			},userID ))
			.rejects.toEqual(Error('Must supply fulltext'))
		userSpy.mockRestore()
		gameSpy.mockRestore()
		done()
	})

	test('Error if: Invalid review _ rating too high', async done => {
		expect.assertions(1)


		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))

		const userID = await user.register('Samson', 'Password')

		const retreiveGame = await game.getGameByTitle('title')
		await expect(review.addReview(retreiveGame.ID,
			{
				fullText: 'fulltext',
				rating: 6
			},userID))
			.rejects.toEqual(Error('Rating must be 1-5'))
		userSpy.mockRestore()
		gameSpy.mockRestore()
		done()
	})

	test('Error if: Invalid review _ rating too low', async done => {
		expect.assertions(1)

		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))
		const userID = await user.register('Samson', 'Password')
		await game.addNewGame('title', 'summary', 'desc')
		const retreiveGame = await game.getGameByTitle('title')
		await expect(review.addReview(retreiveGame.ID,
			{
				fullText: 'fulltext',
				rating: 0
			},userID))
			.rejects.toEqual(Error('Rating must be 1-5'))

		userSpy.mockRestore()
		gameSpy.mockRestore()
		done()
	})


	test('Error if: Invalid review _ Rating is NaN', async done => {
		expect.assertions(1)
		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))
		const userID = await user.register('Samson', 'Password')
		await expect(review.addReview(0,
			{
				fullText: 'fulltext',
				rating: 'string'
			},userID))
			.rejects.toEqual(Error('Must supply rating'))
		userSpy.mockRestore()
		gameSpy.mockRestore()
		done()
	})

	test('Error if: Invalid review _ ID is NaN', async done => {
		expect.assertions(1)
		const review = await new Reviews()
		const user = await review.users
		const userID = await user.register('Samson', 'Password')
		await expect(review.addReview('string',
			{
				fullText: 'fulltext',
				rating: 3
			},userID))
			.rejects.toEqual(Error('Must supply gameID'))

		done()
	})

	test('Error if: Invalid review _ ID is null', async done => {
		expect.assertions(1)
		const review = await new Reviews()
		const user = await review.users
		const userID = await user.register('Samson', 'Password')
		await expect(review.addReview(null,
			{
				fullText: 'fulltext',
				rating: 3
			},userID))
			.rejects.toEqual(Error('Must supply gameID'))

		done()
	})

	test('Error if: Invalid review _ userID is null', async done => {
		expect.assertions(1)

		const review = await new Reviews()
		const game = await new Games()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const gameSpy = jest.spyOn(game, 'getGameByTitle').mockImplementation(() => ({ID: 1}))


		const retreiveGame = await game.getGameByTitle('title')

		await expect(review.addReview(retreiveGame.ID,
			{
				fullText: 'fulltext',
				rating: 3
			},null))
			.rejects.toEqual(Error('Must supply userID'))

		userSpy.mockRestore()
		gameSpy.mockRestore()

		done()
	})


})
