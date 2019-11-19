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
const adminDB = require('./modules/adminDB')
const Review = require('./modules/review');
const Games = require('./modules/game');

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
const dbName = 'gameReview.db' || ':memory:';
const helpers ={
	
	if_eq : function(a, b, opts) {
		console.log("ifeq: " + a + b);
		if(a == b) // Or === depending on your needs
			return opts.fn(this);
		else
			return opts.inverse(this);
	},

	if_Noteq : function(a, b, opts) {
		if(a != b) // Or === depending on your needs
			return opts.fn(this);
		else
			return opts.inverse(this);
	},

	
}

/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 * @authentication This route requires cookie-based authentication.
 */
router.get('/', async ctx => {
	try {
		if(ctx.session.authorised !== true){
			return ctx.redirect('/login?msg=you need to log in');
		}
		const games = await new Games(dbName);
		const temp = await games.getGames();
		const gamesList = temp.games;

		for(let i = 0; i < gamesList.length; i++){
			const curID = gamesList[i].ID;
			let tempPic = await games.getPictures(curID);
			const pic = tempPic.pictures;
			if(pic == undefined)pic = [];
			
			gamesList[i].pictures = pic;
			
		}
		
		console.log(gamesList);
		const data = {}
		/*if(ctx.query.msg){
			data.msg = ctx.query.msg
		} */
		await ctx.render('index', { games:gamesList});
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.get('/game', async ctx => {
	try {
		if(ctx.session.authorised !== true){
			return ctx.redirect('/login?msg=you need to log in');
		}
		const games = await new Games(dbName)
		const review = await new Review(dbName)

		if(!ctx.query.gameID) await ctx.render('error', {message: "No game chosen"})

		const gameID = ctx.query.gameID;
		let thisGame = await games.getGameByID(gameID);

		let temp= await games.getPictures(gameID);
		let pic = temp.pictures

		if(pic == undefined)pic = [];
		thisGame.pictures = pic;

		temp = await review.getReviewsByGameID(gameID);
		const reviews = temp.reviews;
		let uReview;
		for(let i = 0; i < reviews.length; i++){
			if(reviews[i].userID == ctx.session.userID){
				uReview = reviews[i];
				reviews.splice(i,1)//Remove user's review from main list
				break;
			}
		}

		let ratingsReviews = []
		for(let i = 1; i <= 5; i++){
			ratingsReviews[i] ={
				value:i
			}
			if(i == uReview.rating){
				ratingsReviews[i].checked = true;
			}
		}
		console.log(ratingsReviews)
			
	
		console.log(uReview);
		await ctx.render('game', {
			game: thisGame,
			admin: ctx.session.admin,
			ratingsReview: ratingsReviews,
			allReview : reviews,
			userReview: uReview,
			helpers
		});
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.post('/newGame', async ctx =>{
	try {
		// extract the data from the request
		const body = ctx.request.body
		if(ctx.session.authorised !== true){
			return ctx.redirect('/login?msg=you need to log in');
		}
		
		const game = await new Games(dbName)
		await game.addNewGame(body.title, body.summary, body.desc);

		ctx.redirect(`/`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.post('/addGamePhoto',koaBody,  async ctx =>{
	try {
		// extract the data from the request
		const body = ctx.request.body
		if(ctx.session.authorised !== true){
			return ctx.redirect('/login?msg=you need to log in');
		}
		
		const game = await new Games(dbName)

		const gameID = body.gameID;
		var {path, type} = ctx.request.files.pic1;

		await game.uploadPicture(path, type, gameID);

		ctx.redirect(`/game?gameID=${gameID}`)
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

router.get('/login', async ctx => {
	const data = {}
	if(ctx.query.msg){
		data.msg = ctx.query.msg
	} 
	if(ctx.query.user){
		data.user = ctx.query.user
	} 
	await ctx.render('login', data)
})

router.post('/login', async ctx => {
	try {
		const body = ctx.request.body;
		const user = await new User(dbName);
		const ID = await user.login(body.user, body.pass);
		ctx.session.authorised = true;
		ctx.session.userID = ID;
		return ctx.redirect('/?msg=you are now logged in...')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.get('/logout', async ctx => {
	ctx.session.authorised = null;
	ctx.session.userID = null;
	ctx.redirect('/?msg=you are now logged out')
})

app.use(router.routes())
module.exports = app.listen(port, async() => console.log(`listening on port ${port}`))
