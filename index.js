#!/usr/bin/env node
//Routes File

'use strict'

/* MODULE IMPORTS */
const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticDir = require('koa-static')
const bodyParser = require('koa-bodyparser')
const koaBody = require('koa-body')({multipart: true, uploadDir: '.'})
const session = require('koa-session')
//const jimp = require('jimp')

/* IMPORT CUSTOM MODULES */
const User = require('./modules/user')
const Review = require('./modules/review')
const Games = require('./modules/game')
const Category = require('./modules/category')
const app = new Koa()
const router = new Router()

/* CONFIGURING THE MIDDLEWARE */
app.keys = ['darkSecret']
app.use(staticDir('public'))
app.use(bodyParser())
app.use(session(app))
app.use(views(`${__dirname}/views`, { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}))
const defaultPort = 8080
const port = process.env.PORT || defaultPort
const dbName = 'gameReview.db' || ':memory:'
const helpers ={

	if_eq: function(a, b, opts) {
		// eslint-disable-next-line eqeqeq
		if(a == b)
			return opts.fn(this)
		else
			return opts.inverse(this)
	},
	if_Noteq: function(a, b, opts) {
		// eslint-disable-next-line eqeqeq
		if(a != b)
			return opts.fn(this)
		else
			return opts.inverse(this)
	},
	if_EqOREq: function(a, b, c, opts) {
		// eslint-disable-next-line eqeqeq
		if(a || b == c)
			return opts.fn(this)
		else
			return opts.inverse(this)
	}
}

/**
 * The secure home page.
 *
 * @name Home Page - displays the games
 * @route {GET} /
 * @authentication This route requires cookie-based authentication.
 */
router.get('/', async ctx => {
	try {
		if(ctx.session.authorised !== true)return ctx.redirect('/login?msg=you need to log in')

		const games = await new Games(dbName)

		const review = await new Review(dbName)
		const category = await new Category(dbName)
		let gamesList = (await games.getGames()).games

		if(ctx.request.query.category) gamesList = (await category.getGamesOfCategory(ctx.request.query.category)).games
		const categories = (await category.getAllCategories()).categories

		for(let i = 0; i < gamesList.length; i++) {//Set the list of games with their pictures
			gamesList[i].pictures = (await games.getPictures(gamesList[i].ID)).pictures
			gamesList[i].avgRating = Math.round(await review.getAverageRating(gamesList[i].ID))
			gamesList[i].category = (await category.getCategories(gamesList[i].ID)).categories//Get all other categories
		}
		//Render the home page
		await ctx.render('index', {games: gamesList,categories: categories,
			selectedCat: ctx.request.query.category,helpers})
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})


/**
 * The game main page
 *
 * @name game Page
 * @route {GET} /game
 * @authentication This route requires cookie-based authentication.
 *
 */
router.get('/game', async ctx => {
	try {
		if(ctx.session.authorised !== true || !ctx.query.gameID)return ctx.redirect('/')
		const games = await new Games(dbName)
		const review = await new Review(dbName)
		const category = await new Category(dbName)


		const gameID = ctx.query.gameID
		const thisGame = await games.getGameByID(gameID)

		thisGame.pictures = (await games.getPictures(gameID)).pictures//Get pictures for the game

		const reviews = await review.getReviewsByGameID(gameID, ctx.session.admin, ctx.session.userID)//Get all reviews


		thisGame.category = (await category.getCategories(gameID)).categories//get all categories
		thisGame.otherCategories = (await category.getOtherCategories(gameID)).categories//Get all other categories
		thisGame.publishers = (await games.getPublishers(gameID)).publishers

		const ratingsReviews = [{value: 1},{value: 2},{value: 3},{value: 4},{value: 5}]//Set ratings
		const avgRating = await review.getAverageRating(gameID)
		//Render game main page
		await ctx.render('game', {game: thisGame,admin: ctx.session.admin,ratingsReview: ratingsReviews,
			allReview: reviews.reviews,userReview: reviews.userReview,averageRating: Math.round(avgRating),helpers})
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * Script to handle admin updates to a review
 *
 * @name reviewAdminUpdate script
 * @route {POST} /reviewAdminUpdate
 * @authentication This route requires cookie-based authentication.
 *
 */
router.post('/reviewAdminUpdate', async ctx => {
	try{
		// extract the data from the request
		const body = ctx.request.body
		if(ctx.session.authorised !== true || !ctx.session.admin)return ctx.redirect('/login?msg=you need to log in')
		// call the functions in the module
		const review = await new Review(dbName)

		const gameID = body.gameID
		const reviewID = body.reviewID


		if(body.delete) {
			await review.deleteReviewByID(reviewID)
		}else{
			await review.publishReview(reviewID, body.flag )
		}

		ctx.redirect(`game?gameID=${gameID}`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})


/**
 * Script to delete a game
 *
 * @name deleteGame script
 * @route {POST} /deleteGame
 * @authentication This route requires cookie-based authentication.
 *
 */
router.post('/deleteGame', async ctx => {
	try{
		// extract the data from the request
		const body = ctx.request.body
		if(ctx.session.authorised !== true || !ctx.session.admin)return ctx.redirect('/login?msg=you need to log in')
		// call the functions in the module
		const game = await new Games(dbName)

		const gameID = body.gameID

		if(body.delete) await game.deleteGameByID(gameID)

		ctx.redirect('/')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})


/**
 * Script to remove a category to a game
 *
 * @name removeCategoryFromGame script
 * @route {POST} /removeCategoryFromGame
 * @authentication This route requires cookie-based authentication.
 *
 */
router.post('/removeCategoryFromGame', async ctx => {
	try{
		const body = ctx.request.body
		if(ctx.session.authorised !== true) {//Ensure authorised access
			return ctx.redirect('/login?msg=you need to log in')
		}
		const category = await new Category(dbName)

		const gameID = body.gameID
		const catID = body.categoryID

		await category.unassociateToCategory(gameID, catID)

		//refresh
		ctx.redirect(`game?gameID=${gameID}`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * Script to add a category to a game
 *
 * @name addCategoryToGame script
 * @route {POST} /addCategoryToGame
 * @authentication This route requires cookie-based authentication.
 *
 */
router.post('/addCategoryToGame', async ctx => {
	try {
		// extract the data from the request
		const body = ctx.request.body
		if(ctx.session.authorised !== true) {//Ensure authorised access
			return ctx.redirect('/login?msg=you need to log in')
		}

		const category = await new Category(dbName)
		const gameID = body.gameID

		await category.associateToCategory(gameID, body.category)
		//refresh
		ctx.redirect(`game?gameID=${gameID}`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * Script to add a review to a game
 *
 * @name addReview script
 * @route {POST} /addReview
 * @authentication This route requires cookie-based authentication.
 *
 */
router.post('/addReview', async ctx => {
	try {
		// extract the data from the request
		const body = ctx.request.body
		if(ctx.session.authorised !== true)return ctx.redirect('/login?msg=you need to log in')
		// call the functions in the module
		const review = await new Review(dbName)

		const gameID = body.gameID
		//Add the review
		await review.addReview(gameID, {
			fullText: body.fullText,
			rating: body.rating
		}, ctx.session.userID)
		//refresh
		ctx.redirect(`game?gameID=${gameID}`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})


/**
 * The new game form
 *
 * @name newGame form
 * @route {GET} /newGame
 * @authentication This route requires cookie-based authentication.
 *
 */
router.get('/newGame', async ctx => {
	try {
		if(ctx.session.authorised !== true)return ctx.redirect('/login?msg=you need to log in')

		await ctx.render('addGame', {
			helpers
		})
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * Script to add a new game
 *
 * @name newGame script
 * @route {POST} /newGame
 * @authentication This route requires cookie-based authentication.
 *
 */
router.post('/newGame', async ctx => {
	try {
		// extract the data from the request
		const body = ctx.request.body
		if(ctx.session.authorised !== true)return ctx.redirect('/login?msg=you need to log in')
		const game = await new Games(dbName)

		//Add the new game
		await game.addNewGame(body.title, body.summary, body.desc)
		const gameID = (await game.getGameByTitle(body.title)).ID
		//Go back to home
		ctx.redirect(`/game?gameID=${gameID}`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * Script to add a game photo
 *
 * @name addGamePhoto script
 * @route {POST} /addGamePhoto
 * @authentication This route requires cookie-based authentication.
 *
 */
router.post('/addGamePhoto',koaBody, async ctx => {
	try {
		// extract the data from the request
		const body = ctx.request.body
		if(ctx.session.authorised !== true || !ctx.session.admin)return ctx.redirect('/login?msg=you need to log in')

		const game = await new Games(dbName)

		const gameID = body.gameID
		//Destructure to retrieve path and type
		const {path, type} = ctx.request.files.pic1
		//Upload picture
		await game.uploadPicture(path, type, gameID)
		//Refresh
		ctx.redirect(`/game?gameID=${gameID}`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * Script to update reviews where users have had a review before
 *
 * @name updateReview script
 * @route {POST} /updateReview
 * @authentication This route requires cookie-based authentication.
 *
 */
router.post('/updateReview', async ctx => {
	try {
		// extract the data from the request
		const body = ctx.request.body
		console.log(body)
		if(ctx.session.authorised !== true)return ctx.redirect('/login?msg=you need to log in')
		// call the functions in the module
		const review = await new Review(dbName)
		const gameID = body.gameID
		//Update review
		await review.updateReview(ctx.session.userID, gameID, {
			fullText: body.fullText,
			rating: body.rating
		})
		//Refresh
		ctx.redirect(`game?gameID=${gameID}`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register'))

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post('/register', koaBody, async ctx => {
	try {
		// extract the data from the request
		const body = ctx.request.body
		console.log(body)
		// call the functions in the module
		const user = await new User(dbName)
		await user.register(body.user, body.pass)

		// await user.uploadPicture(path, type)
		// redirect to the home page
		ctx.redirect(`/?msg=new user "${body.name}" added`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * The user login page.
 *
 * @name login Page
 * @route {GET} /login
 */
router.get('/login', async ctx => {
	const data = {}
	if(ctx.query.msg) {
		data.msg = ctx.query.msg
	}
	if(ctx.query.user) {
		data.user = ctx.query.user
	}
	await ctx.render('login', data)
})

/**
 * The script to process logins
 *
 * @name login Script
 * @route {POST} /login
 */
router.post('/login', async ctx => {
	try {
		const body = ctx.request.body
		const user = await new User(dbName)
		const ID = await user.login(body.user, body.pass)
		const authUser = await user.getUserByID(ID)
		ctx.session.authorised = true
		ctx.session.userID = ID
		ctx.session.admin = false
		const adminRoleID = 2
		if(authUser.roleID === adminRoleID)ctx.session.admin = true

		return ctx.redirect('/?msg=you are now logged in...')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * The page to process logouts
 *
 * @name logout Script
 * @route {POST} /logout
 */
router.get('/logout', async ctx => {

	//Remove authorisation
	ctx.session.authorised = null
	ctx.session.userID = null
	ctx.session.admin = null
	ctx.redirect('/?msg=you are now logged out')
})

app.use(router.routes())
module.exports = app.listen(port, async() => console.log(`listening on port ${port}`))
