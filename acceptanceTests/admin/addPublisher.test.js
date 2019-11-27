'use strict'

const puppeteer = require('puppeteer')
const { configureToMatchImageSnapshot } = require('jest-image-snapshot')
const PuppeteerHar = require('puppeteer-har')
const shell = require('shelljs')
const sqlite = require('sqlite-async')

const width = 800
const height = 600
const delayMS = 5

let browser
let page
let har

// threshold is the difference in pixels before the snapshots dont match
const toMatchImageSnapshot = configureToMatchImageSnapshot({
	customDiffConfig: { threshold: 2 },
	noColors: true,
})
expect.extend({ toMatchImageSnapshot })

beforeAll( async() => {
	browser = await puppeteer.launch({ headless: true, slowMo: delayMS, args: [`--window-size=${width},${height}`] })
	page = await browser.newPage()
	har = new PuppeteerHar(page)
	await page.setViewport({ width, height })
	await shell.exec('acceptanceTests/scripts/beforeAll.sh')
})

afterAll( async() => {
	browser.close()
	await shell.exec('acceptanceTests/scripts/afterAll.sh')
})

beforeEach(async() => {
	await shell.exec('acceptanceTests/scripts/beforeEach.sh')
})

describe('Adding publisher', () => {
	test('Add publisher', async done => {
		//start generating a trace file.
		await page.tracing.start({path: 'trace/addPublisher.json',screenshots: true})
		await har.start({path: 'trace/results.har'})

		//ARRANGE
		await page.goto('http://localhost:8080/register', { timeout: 30000, waitUntil: 'load' })
		const db = await sqlite.open('gameReview.db')
		//ACT
		await page.type('input[name=user]', 'NewUser')
		await page.type('input[name=pass]', 'password')
		await page.click('input[type=submit]')


		const sql = `UPDATE user
            SET roleID = 2
            WHERE username = 'NewUser';`
		await db.run(sql)//Sets to admin

		const sql1 = 'SELECT * FROM user;'
		console.log(await db.all(sql1))

		await page.goto('http://localhost:8080/login', { timeout: 30000, waitUntil: 'load' })
		await page.type('input[name=user]', 'NewUser')
		await page.type('input[name=pass]', 'password')
		await page.click('input[type=submit]')

		await page.goto('http://localhost:8080/newPublisher', { timeout: 30000, waitUntil: 'load' })
		await page.type('input[name=name]', 'Rocky')
		await page.click('button[type=submit]')

		await page.goto('http://localhost:8080/', { timeout: 30000, waitUntil: 'load' })


		//ASSERT
		//check that the user is taken to the homepage after attempting to login as the new user:
		await page.waitForSelector('select[name=publisher]')

		expect( await page.evaluate( () => document.querySelector('select[name=publisher]').children.length ) )
			.toBe(2)

		await page.goto('http://localhost:8080/logout', { timeout: 30000, waitUntil: 'load' })
		// grab a screenshot
		const image = await page.screenshot()
		// compare to the screenshot from the previous test run

		expect(image).toMatchImageSnapshot()
		// stop logging to the trace files
		await page.tracing.stop()
		await har.stop()
		done()
	}, 16000)
})
