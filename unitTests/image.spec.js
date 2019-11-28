
'use strict'
const Image = require('../modules/image.js')
const mock = require('mock-fs')
const fs = require('fs-extra')
const mime = require('mime-types')


describe('getPicturesByGameID()', () => {
	beforeEach(() => {
		//console.log('')
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
		//console.log('')
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
		//console.log('')
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
		expect(fs.existsSync('public/game/1/picture_0.png')).toBe(true)
		done()
	})

	test('Error if invalid file', async done => {
		expect.assertions(1)

		const image = await new Image()

		await expect( image.uploadPictureToGame('user/text/test.txt','text/plain',1))
			.rejects.toEqual(Error('Not an image'))
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
		//console.log('')
		mock({
			public: {
				game: {

				}

			},
			'user/images/pictureUpload.png': 'data:image/png;base64,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',
			'/tmp/user/images/pictureUpload.png': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAM1BMVEUKME7///+El6bw8vQZPVlHZHpmfpHCy9Ojsbzg5ekpSmTR2N44V29XcYayvsd2i5yTpLFbvRYnAAAJcklEQVR4nO2d17arOgxFs+kkofz/154Qmg0uKsuQccddT/vhnOCJLclFMo+//4gedzcApf9B4srrusk+GsqPpj+ypq7zVE9LAdLWWVU+Hx69y2FMwAMGyfusLHwIpooyw9IAQfK+8naDp3OGHvZ0FMhrfPMgVnVjC2kABOQ1MLvi0DEIFj1ILu0LU2WjNRgtSF3pKb4qqtd9IHmjGlJHlc09IHlGcrQcPeUjTAySAGNSkQlRhCCJMGaUC0HSYUx6SmxFAtJDTdylsr4ApC1TY0yquKbCBkk7qnYVzPHFBHkBojhVJWviwgPJrsP4qBgTgbQXdsesjm4pDJDmIuswVZDdFx0ENTtkihoeqSDXD6tVxOFFBHndMKxWvUnzexpIcx/Gg2goJJDhVo6PCMGRAnKTmZuKm3wcJO/upphUqUHy29yVrRhJDORXOKIkEZDf4YiRhEF+iSNCEgb5KY4wSRDkB/yurUEG8nMcocgYABnvbrVL3nMIP0h/d5udKnwzSC/InfPdkJ6eWb0PJE++dyVVyQP5iQmWW27X5QG5druEKafBu0Hqu9saVOHa8HKC/K6BzHKZiRMEZCDF0Nd1/ZfXI/fcOibHOssFgokg9uFA20BhztHEAZIjIohrD/o1wljeFBDEwBo8YUt5Ir/rNLjOIACPFdy/AbEcPdcJBOCxytjeYAM4Kzp6rhOIPhRGNzwmFP3rOoTFI0irtnQKx6fj1Zt+h9njEUS9mKJxfFRrX5lt7wcQtaWTOfTHeIXVJQcQrRW+OYex2j0a66XZINoO8a7fPH2iHF2mC7ZBtB3Czb5QvjizSx7A3308mRzqAwujSywQbYfwc0iU8zqjS0yQ6ztEHX9332KCaGNIYB/Qq1z3yN0oDZBWyeFYJBCkm2sXLhDtpKFwNDMu5TnrZpYGiHbK4Nlwikg5DrYV1g6iPoJmzE5MKd/fOp53EPUaQZaLqH3u+vo2ELWp3wSyWuYGoj9EEIJoV3L9AUS/ZLsJpLNBXmqOu0CW6P5A/dx9IL0FAji/FYKot9EqE0Tvs6QBUe/2CxMEkZAlBNGPhdoAQWyTSmbxUwvUygwQyMmniAPgLt87CODXHuftWJIQgzrfQDC5AfwSgz9MmmG/gWCOqDgZ4JsQeTvZBoJJDhAFEsSDyxUEEUUekk0UEMhjBcEcGsoWVpBU3NcCgkkPkJWrKbdRZvULCMTWhYEdMrayBQRyqHcnSLmAIH7LcWJ8Hch7BsHEdWFpJsZjziCgFBpZ9TPm4e0XBJTTJKt9xjy8RoLI4gimPLP5goCSgWTrEcyzsy8IqmZVMo0H5bJiQToBCOjZ5RcElhjLN3dU7uQMAvoxwQkJZKI1CQzCthJYEigahHuDDi4rFwzCPQ7F1fiDQZgTR5iJwEGYRgIsiECD8BwwMAEfDcIaW8CRBQdhjS1kJQEchDEFhiRKr4KDFPS9FGQNVwEHoW83QjsEHdkfnuIOl6C1NjMItiaCaCWgbdpFJXQ9soh2uoB9aJcCxFdgZwlcrTmvENGlrITBBdpK25Qhd1F2RScq8CKu/gsCL8qN5THjy+Rr5E6joYgPxpdl518QrCf8Kpgjn6C8HLkbb+vt7ZM8wdVvy258khsRfHaS5DalDnlidZT7Erk+SXV5Bj1D3LS29XyhVJuoKHs9Q8S6reK11oUc7vPcr9uswP3SLiDINefXOF5rwCuGzVT6zVkVPfh2wWmHcz4wAwba2cgN1/Tsvleu7//i69CgVyt1GwjOs2+XK3rtbl151Tg3vOeioG40Mz2V+6pQ4xbJHOZj6g0EMxk93tV7fuedvVZpQSPhbwNBGInrymGrwNh1GXmL8F+lAaJ+NU/fzcmvJqvKj7177+1v1GY/GiBKI1Fdy/2XK6upXwaIJpI8B/399W0mH9zzafKaeCF9J0WF+jyCuFusTGzZKhFH8dVLZql2brxgcdVBKb7KG/7UZTmB3XJ6uL/QYT5ScRI74FcHEJ7feopyfGkaeaGlPoCw/BbjZmSBWIvINQNmTxdjWJqwUI8sztR4nYPuIPSTSUnOCZOE3ierqRoJfNSQxDjLEYs8i91eqgFCDSWiFHiuqAN9CwEGCPEISVjvwhS7Mfx6dtX8kC5aqvneGBOEFN2v6RBiYwr3DQOkLhEW6fHFbIwFQnkLiWYmZxE220z/aedPx99C+hiyKR4OzNFhg8S75CJTnxQ1dyugHTLaY10iu9dBpmhQtMz1ABLrkgtHVnRsPUO3OcU25i8cWdGxZbflCBKJqBdMs3aF/dYhNexU9RFcYEmLXYQKghyWdufyldBSU3KpjkKhZclxTXQGCTkL/HZDUIH5+Gkt4SgoCtj7pSYSNJLTK3VVRnmXZxebSMBIzmHABeIdXBebiN9eHYtUZ62ab3BdGkUm+SKJw1bdRXeewaX7qqdAnljg2sVxg3guAk3baofcg9yZ2eZpnHNvSFrEqhB9YPjesmt0pt6Xc8hl7W5L9Q4Xx09ctsrd5VhWeF6nF8SRrZdw49qns//0xTK/AZ8vGr3caTliuzeFNeCJTgafpKlhHd2WP1sy1LqDF798gjKJPLqDr9keoTd43+NyNzC1CI8Xy2lcPtOaVBI5IiAWyQ3e125AcKoXs2Djhy5eVc3KiBxREIPkhjBiLhIjU++4T91IbggjRiCJLSEIwWGddkEaxlVN5KCArPHk8mXVpHk8FHH7JL3n5dPA7C90q7XkeFJucacNmGXeRfswLE71HA79efaGiCN/Ofjmfmtcp8X10tIsqCacV5xfRWjNUiXGYbovWgyFYHcQLak15K9oM5zqmgaeKsHJetbSHfSPzXOiw/rxE9YH4CXaUpsZ0ztemFurP95Jpyvrd29YTpIZr7cEJHqfc7Wl0PFm2+yJR70udaokKFtGPTdm8WdQe24+HmVLlueboWQquBcYYVH2vEzfh8kCks1p90eWsLCyZ8qK7E86Oe+3XYFnBuiWdth20UqZR5SvMoyPg3WNauJipi0LMTQgVq5xUUlZcrPsopPHJ926z8pm7xyFLrH/PxpHSoXKdWgXsLn1scZn1ZDd/2vszN3lt254qkE+qu3yoqLM+ghN3Qz2qcVzUC/ZMFsK/alU6l0OWV/bQz6v6yYbyuN5BaZ4A7Y30vs/PPksS2+qzlvfF7OQmzzcL7W+xa7OIfRuVdtn/tdvdFLnL4OTKcm2W16PmWc4FWWXNSlWM2n3D+uPxuyrcfo74aP+Ac30a82+oLmfAAAAAElFTkSuQmCC'
		})
	})

	afterEach(mock.restore)

	test('Valid reviewID', async done => {
		expect.assertions(2)

		const image = await new Image()
		const path = 'user/images/pictureUpload.png'
		const type = 'image/png'
		//const picPath = `review/${reviewID}/picture_${sqlReturn.records}.${extension}`
		expect(await image.uploadPictureToReview(path,type,1)).toBe(true)
		expect(fs.existsSync('public/review/1/picture_0.png')).toBe(true)
		done()
	})

	test('Error if invalid file', async done => {
		expect.assertions(1)

		const image = await new Image()

		await expect( image.uploadPictureToReview('user/text/test.txt','text/plain',1))
			.rejects.toEqual(Error('Not an image'))
		done()
	})

	test('Error if reviewID is null', async done => {
		expect.assertions(1)

		const image = await new Image()

		const path = 'user/images/pictureUpload.png'
		const type = '.png'

		await expect(image.uploadPictureToReview(path,type,null))
			.rejects.toEqual(Error('Must supply reviewID'))
		done()
	})

	test('Error if reviewID is NaN', async done => {
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
