'use strict'
const Reviews = require('../modules/review.js')
const Comments = require('../modules/comment.js')
const Users = require('../modules/user.js')

describe('addComment()', () => {
	test('Valid comment', async done => {
		expect.assertions(1)

		const comment = await new Comments()
		const review = await new Reviews()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const reviewSpy = jest.spyOn(review, 'addReview').mockImplementation(() => 1)

		const userID = await user.register()

		const reviewID = await review.addReview()

		const fullText = 'I do not think this review is true'

		const result = await comment.addComment(reviewID, userID, fullText)

		expect(result).toBe(1)

		userSpy.mockRestore()
		reviewSpy.mockRestore()
		done()
	})

	test('Error if reviewID is null', async done => {
		expect.assertions(1)

		const comment = await new Comments()
		const review = await new Reviews()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const reviewSpy = jest.spyOn(review, 'addReview').mockImplementation(() => 1)

		const userID = await user.register()

		const reviewID = null

		const fullText = 'I do not think this review is true'

		await expect( comment.addComment(reviewID, userID, fullText))
			.rejects.toEqual(Error('ReviewID must be supplied'))


		userSpy.mockRestore()
		reviewSpy.mockRestore()
		done()
	})

	test('Error if reviewID is NaN', async done => {
		expect.assertions(1)

		const comment = await new Comments()
		const review = await new Reviews()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const reviewSpy = jest.spyOn(review, 'addReview').mockImplementation(() => 1)

		const userID = await user.register()

		const reviewID = 'Not a number'

		const fullText = 'I do not think this review is true'

		await expect( comment.addComment(reviewID, userID, fullText))
			.rejects.toEqual(Error('ReviewID must be supplied'))


		userSpy.mockRestore()
		reviewSpy.mockRestore()
		done()
	})

	test('Error if reviewID is undefined', async done => {
		expect.assertions(1)

		const comment = await new Comments()
		const review = await new Reviews()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const reviewSpy = jest.spyOn(review, 'addReview').mockImplementation(() => 1)

		const userID = await user.register()

		const reviewID = undefined

		const fullText = 'I do not think this review is true'

		await expect( comment.addComment(reviewID, userID, fullText))
			.rejects.toEqual(Error('ReviewID must be supplied'))


		userSpy.mockRestore()
		reviewSpy.mockRestore()
		done()
	})

	test('Error if userID is null', async done => {
		expect.assertions(1)

		const comment = await new Comments()
		const review = await new Reviews()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const reviewSpy = jest.spyOn(review, 'addReview').mockImplementation(() => 1)

		const reviewID = await review.addReview()

		const userID = null

		const fullText = 'I do not think this review is true'

		await expect( comment.addComment(reviewID, userID, fullText))
			.rejects.toEqual(Error('userID must be supplied'))


		userSpy.mockRestore()
		reviewSpy.mockRestore()
		done()
	})

	test('Error if userID is NaN', async done => {
		expect.assertions(1)

		const comment = await new Comments()
		const review = await new Reviews()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const reviewSpy = jest.spyOn(review, 'addReview').mockImplementation(() => 1)

		const reviewID = await review.addReview()

		const userID = 'Not a number'

		const fullText = 'I do not think this review is true'

		await expect( comment.addComment(reviewID, userID, fullText))
			.rejects.toEqual(Error('userID must be supplied'))


		userSpy.mockRestore()
		reviewSpy.mockRestore()
		done()
	})

	test('Error if userID is undefined', async done => {
		expect.assertions(1)

		const comment = await new Comments()
		const review = await new Reviews()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const reviewSpy = jest.spyOn(review, 'addReview').mockImplementation(() => 1)
		const reviewID = await review.addReview()
		const userID = undefined

		const fullText = 'I do not think this review is true'

		await expect( comment.addComment(reviewID, userID, fullText))
			.rejects.toEqual(Error('userID must be supplied'))


		userSpy.mockRestore()
		reviewSpy.mockRestore()
		done()
	})

	test('Error if fullText is null', async done => {
		expect.assertions(1)

		const comment = await new Comments()
		const review = await new Reviews()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const reviewSpy = jest.spyOn(review, 'addReview').mockImplementation(() => 1)
		const reviewID = await review.addReview()
		const userID = await user.register()

		const fullText = null

		await expect( comment.addComment(reviewID, userID, fullText))
			.rejects.toEqual(Error('userID must be supplied'))


		userSpy.mockRestore()
		reviewSpy.mockRestore()
		done()
	})

	test('Error if fullText is empty', async done => {
		expect.assertions(1)

		const comment = await new Comments()
		const review = await new Reviews()
		const user = await new Users()
		const userSpy = jest.spyOn(user, 'register').mockImplementation(() => 1)
		const reviewSpy = jest.spyOn(review, 'addReview').mockImplementation(() => 1)
		const reviewID = await review.addReview()
		const userID = await user.register()

		const fullText = ''

		await expect( comment.addComment(reviewID, userID, fullText))
			.rejects.toEqual(Error('userID must be supplied'))


		userSpy.mockRestore()
		reviewSpy.mockRestore()
		done()
	})
})
