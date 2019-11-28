'use strict'

const app = require('../index')
const supertest = require('supertest')
const shell = require('shelljs')

const request = supertest(app)
beforeAll( async() => {
	await shell.exec('integrationTests/scripts/beforeAll.sh')
})

afterAll( async() => {
	app.close()
	await shell.exec('integrationTests/scripts/afterAll.sh')
	await new Promise(resolve => setTimeout(() => resolve(), 500)) // avoid jest open handle error


})

beforeEach(async() => {
	await shell.exec('integrationTests/scripts/beforeEach.sh')

})

describe('User Endpoints', () => {
	test('should get register page', async done => {

		const res = await request
			.get('/register')

		expect(res.status).toBe(200)

		done()
	})

	test('Should register user', async done => {
		request
			.post('/register')
			.send({user: 'newuser', pass: '123'})
			.type('form')
			.set('Accept', /application\/json/)
			.expect(200)
			.end((err, res) => {
				if(err) throw err
			})

		done()
	})

	test('Should login user', async done => {
		request
			.post('/register')
			.send({user: 'newuser', pass: '123'})
			.type('form')
			.set('Accept', /application\/json/)

		request
			.post('/login')
			.send({user: 'newuser', pass: '123'})
			.type('form')
			.set('Accept', /application\/json/)
			.expect(200)
			.end((err, res) => {
				if(err) throw err
			})

		const res = await request
			.get('/')

		expect(res.status).toBe(302)

		done()
	})

	test('Should logout', async done => {
		request
			.post('/register')
			.send({user: 'newuser', pass: '123'})
			.type('form')
			.set('Accept', /application\/json/)

		request
			.post('/login')
			.send({user: 'newuser', pass: '123'})
			.type('form')
			.set('Accept', /application\/json/)
			.expect(200)
			.end((err) => {
				if(err) throw err
			})

		request
			.post('/logout')
			.send({user: 'newuser', pass: '123'})
			.type('form')
			.set('Accept', /application\/json/)
			.expect(200)
			.end((err) => {
				if(err) throw err
			})


		done()
	})

})
