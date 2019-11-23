
'use strict'
const Image = require('../modules/image.js')
const mock = require('mock-fs')
const fs = require('fs')
const mime = require('mime-types')

describe('getPicturesByGameID()', () => {
	beforeEach(() => {
		//console.log("");
		mock({
			public: {
				game: {

				}

			},
			'user/images/pictureUpload.png': Buffer.from([8, 6, 7, 5, 3, 0, 9]),
			'user/images/pictureUpload2.png': Buffer.from([8, 6, 7, 5, 3, 0, 9])
		})
	})
	afterEach(mock.restore)

	test('Valid game', async done => {
		expect.assertions(1)

		const image = await new Image()

		await image.uploadPictureToGame('user/images/pictureUpload.png','image/png',1)
		await image.uploadPictureToGame('user/images/pictureUpload2.png','image/png',1)

		const extension = await mime.extension('image/png')
		expect(await image.getPicturesByGameID(1))
			.toMatchObject(
				{
					pictures: [
						`game/1/picture_0.${extension}`,
						`game/1/picture_1.${extension}`
					]
				}
			)

		done()
	})

	test('Error if gameID is null', async done => {
		expect.assertions(1)

		const image = await new Image()

		await expect(image.getPicturesByGameID(null))
			.rejects.toEqual(Error('Must supply gameID'))

		done()
	})

	test('Error if gameID is NaN', async done => {
		expect.assertions(1)

		const image = await new Image()

		await expect(image.getPicturesByGameID('Not a number'))
			.rejects.toEqual(Error('Must supply gameID'))

		done()
	})
})

describe('getPicturesByReviewID()', () => {
	beforeEach(() => {
		//console.log("");
		mock({
			public: {
				game: {

				}

			},
			'user/images/pictureUpload.png': Buffer.from([8, 6, 7, 5, 3, 0, 9]),
			'user/images/pictureUpload2.png': Buffer.from([8, 6, 7, 5, 3, 0, 9])
		})
	})
	afterEach(mock.restore)

	test('Valid review', async done => {
		expect.assertions(1)

		const image = await new Image()

		await image.uploadPictureToReview('user/images/pictureUpload.png','image/png',1)
		await image.uploadPictureToReview('user/images/pictureUpload2.png','image/png',1)

		const extension = await mime.extension('image/png')
		expect(await image.getPicturesByReviewID(1))
			.toMatchObject(
				{
					pictures: [
						`review/1/picture_0.${extension}`,
						`review/1/picture_1.${extension}`
					]
				}
			)

		done()
	})

	test('Error if gameID is null', async done => {
		expect.assertions(1)

		const image = await new Image()

		await expect(image.getPicturesByReviewID(null))
			.rejects.toEqual(Error('Must supply reviewID'))

		done()
	})

	test('Error if gameID is NaN', async done => {
		expect.assertions(1)

		const image = await new Image()

		await expect(image.getPicturesByReviewID('Not a number'))
			.rejects.toEqual(Error('Must supply reviewID'))

		done()
	})
})


describe('uploadPictureToGame()', () => {
	beforeEach(() => {
		//console.log("");
		mock({
			public: {
				game: {

				}

			},
			'user/images/pictureUpload.png': Buffer.from([8, 6, 7, 5, 3, 0, 9])
		})
	})

	afterEach(mock.restore)

	test('Valid game', async done => {
		expect.assertions(2)

		const image = await new Image()
		const path = 'user/images/pictureUpload.png'
		const type = 'image/png'


		expect(await image.uploadPictureToGame(path,type,1)).toBe(true)
		const extension = await mime.extension(type)

		expect( await fs.existsSync(`public/game/1/picture_0.${extension}`)).toBe(true)


		done()
	})

	test('Error if gameID is null', async done => {
		expect.assertions(1)

		const image = await new Image()

		const path = 'user/images/pictureUpload.png'
		const type = '.png'

		await expect(image.uploadPictureToGame(path,type,null))
			.rejects.toEqual(Error('Must supply gameID'))
		done()
	})

	test('Error if gameID is NaN', async done => {
		expect.assertions(1)

		const image = await new Image()

		const path = 'user/images/pictureUpload.png'
		const type = '.png'

		await expect(image.uploadPictureToGame(path,type,'Not a Number'))
			.rejects.toEqual(Error('Must supply gameID'))
		done()
	})

	test('Error if path is null', async done => {
		expect.assertions(1)

		const image = await new Image()

		const type = '.png'

		await expect(image.uploadPictureToGame(null,type,1))
			.rejects.toEqual(Error('Must supply path'))
		done()
	})

	test('Error if path is empty', async done => {
		expect.assertions(1)

		const image = await new Image()

		const type = '.png'

		await expect(image.uploadPictureToGame('',type,1))
			.rejects.toEqual(Error('Must supply path'))
		done()
	})

	test('Error if type is null', async done => {
		expect.assertions(1)

		const image = await new Image()

		const path = 'user/images/pictureUpload.png'

		await expect(image.uploadPictureToGame(path,null,1))
			.rejects.toEqual(Error('Must supply type'))
		done()
	})

	test('Error if type is empty', async done => {
		expect.assertions(1)

		const image = await new Image()

		const path = 'user/images/pictureUpload.png'

		await expect(image.uploadPictureToGame(path,'',1))
			.rejects.toEqual(Error('Must supply type'))
		done()
	})
})

describe('uploadPictureToReview()', () => {
	beforeEach(() => {
		//console.log("");
		mock({
			public: {
				game: {

				}

			},
			'user/images/pictureUpload.png': Buffer.from([8, 6, 7, 5, 3, 0, 9])
		})
	})

	afterEach(mock.restore)

	test('Valid game', async done => {
		expect.assertions(2)

		const image = await new Image()
		const path = 'user/images/pictureUpload.png'
		const type = 'image/png'


		expect(await image.uploadPictureToReview(path,type,1)).toBe(true)
		const extension = await mime.extension(type)

		expect( await fs.existsSync(`public/review/1/picture_0.${extension}`)).toBe(true)


		done()
	})

	test('Error if gameID is null', async done => {
		expect.assertions(1)

		const image = await new Image()

		const path = 'user/images/pictureUpload.png'
		const type = '.png'

		await expect(image.uploadPictureToReview(path,type,null))
			.rejects.toEqual(Error('Must supply reviewID'))
		done()
	})

	test('Error if gameID is NaN', async done => {
		expect.assertions(1)

		const image = await new Image()

		const path = 'user/images/pictureUpload.png'
		const type = '.png'

		await expect(image.uploadPictureToReview(path,type,'Not a Number'))
			.rejects.toEqual(Error('Must supply reviewID'))
		done()
	})

	test('Error if path is null', async done => {
		expect.assertions(1)

		const image = await new Image()

		const type = '.png'

		await expect(image.uploadPictureToReview(null,type,1))
			.rejects.toEqual(Error('Must supply path'))
		done()
	})

	test('Error if path is empty', async done => {
		expect.assertions(1)

		const image = await new Image()

		const type = '.png'

		await expect(image.uploadPictureToReview('',type,1))
			.rejects.toEqual(Error('Must supply path'))
		done()
	})

	test('Error if type is null', async done => {
		expect.assertions(1)

		const image = await new Image()

		const path = 'user/images/pictureUpload.png'

		await expect(image.uploadPictureToReview(path,null,1))
			.rejects.toEqual(Error('Must supply type'))
		done()
	})

	test('Error if type is empty', async done => {
		expect.assertions(1)

		const image = await new Image()

		const path = 'user/images/pictureUpload.png'

		await expect(image.uploadPictureToReview(path,'',1))
			.rejects.toEqual(Error('Must supply type'))
		done()
	})
})
