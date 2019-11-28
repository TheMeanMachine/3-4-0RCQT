'use strict'

const puppeteer = require('puppeteer')
const { configureToMatchImageSnapshot } = require('jest-image-snapshot')
const PuppeteerHar = require('puppeteer-har')
const shell = require('shelljs')

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

beforeAll( async done => {
	browser = await puppeteer.launch({ headless: true, slowMo: delayMS,
		args: [`--window-size=${width},${height}`,'--no-sandbox'] })
	page = await browser.newPage()
	har = new PuppeteerHar(page)
	await page.setViewport({ width, height })
	await shell.exec('acceptanceTests/scripts/beforeAll.sh')
	done()
})

afterAll( async() => {
	//browser.close()
	await shell.exec('acceptanceTests/scripts/afterAll.sh')
})

beforeEach(async() => {
	await shell.exec('acceptanceTests/scripts/beforeEach.sh')
})

describe('Deleting comment', () => {
	test('Add game, add review, add comment, remove comment', async done => {
		//start generating a trace file.
		await page.tracing.start({path: 'trace/deleteComment_har.json',screenshots: true})
		await har.start({path: 'trace/results.har'})

		//ARRANGE
		await page.goto('http://localhost:8080/register', { timeout: 30000, waitUntil: 'load' })
		//ACT
		await page.type('input[name=user]', 'NewUser')
		await page.type('input[name=pass]', 'password')
		await page.click('input[type=submit]')

		await page.goto('http://localhost:8080/login', { timeout: 30000, waitUntil: 'load' })
		await page.type('input[name=user]', 'NewUser')
		await page.type('input[name=pass]', 'password')
		await page.click('input[type=submit]')

		await page.goto('http://localhost:8080/newGame', { timeout: 30000, waitUntil: 'load' })
		await page.type('input[name=title]', 'The world')

		await page.type('textarea[name=summary]', 'Summary')
		await page.type('textarea[name=desc]', 'Description')
		await page.click('button[type=submit]')

		await page.goto('http://localhost:8080/game?gameID=1', { timeout: 30000, waitUntil: 'load' })

		await page.type('textarea[form=review]', 'Fulltext is here', {delay: 20})
		await page.click('button[id=reviewSubmit]')

		await page.type('textarea[form=userComment]', 'Comment is here', {delay: 20})
		await page.click('button[id=commentSubmit]')

		await page.click('input[id=commentDelete1]')
		await page.click('button[id=commentDelete1]')
		//ASSERT

		expect( await page.evaluate( () => document.querySelector('p[id=comment1]') ) )
			.toBe(null)


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
