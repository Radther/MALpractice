'use strict'

// Import
require('./extensions.js')
const rest = require('restify')
const responseCreator = require('./response-creator.js')
const MALintent = require('./MALintent.js')
const StatusCodes = require('./StatusCodes.js').StatusCodes

// Create Server
const app = rest.createServer()

// Setup
app.use(rest.fullResponse())
app.use(rest.bodyParser())
app.use(rest.authorizationParser())
app.use(rest.queryParser())

// Default Port
const defaultPort = 8080

// Custom middleware
app.use(function(req, res, next) {
	if (!req.authorization.basic) {
		const response = responseCreator.createError('basic auth not provided')
		res.send(StatusCodes.unauthorised, response)
		res.end()
	}
	const username = req.username
	const password = req.authorization.basic.password

	if (!username || !password) {
		const response = responseCreator.createError('missing username or password')

		res.send(StatusCodes.unauthorised, response)
		res.end()
	}
	MALintent.verifyUser(username, password)
		.then( () => {
			next()
		}).catch( err => {
			if (err === StatusCodes.unauthorised) {
				const response = responseCreator.createError('Invalid Username or Password')

				res.send(StatusCodes.unauthorised, response)
				res.end()
			} else {
				const response = responseCreator.createError('Unhandled error occured during the authentication process')

				res.send(StatusCodes.badRequest, response)
				res.end()
			}
		})
})

// Routes
// Verify users details
app.get('/', function(req, res, next) {
	res.redirect('/anime', next)
})

// Redirect to anime
app.head('/anime', function(req, res) {
	const response = responseCreator.createResponse('Verification Successful', {
		userid: req.userid,
		username: req.username
	})

	res.send(StatusCodes.ok, response)
})

// Anime collection (Requires 'q' parameter)
app.get('/anime', function(req, res) {
	if (!req.params.q && !req.params.query) {
		const response = responseCreator.createError('\'query\' or \'q\' parameter required')

		res.send(StatusCodes.badRequest, response)
		return
	}

	const username = req.username
	const password = req.authorization.basic.password
	const query = req.params.q || req.params.query

	MALintent.searchAnime(username, password, query)
		.then( animes => {
			const response = responseCreator.createResponse('Search Successful', animes)

			res.send(StatusCodes.ok, response)
			res.end()
		}).catch( err => {
			if (err === StatusCodes.noContent) {
				const response = responseCreator.createError('No Content')

				res.send(StatusCodes.noContent, response)
			} else {
				const response = responseCreator.createError('Invalid Search')

				res.send(StatusCodes.badRequest, response)
			}
			res.end()
		})
})

// Get anime by MyAnimeList ID
app.get('/anime/:animeId', function(req, res) {
	if (!req.params.animeId) {
		const response = responseCreator.createError('missing anime id!')

		res.send(StatusCodes.badRequest, response)
	}

	const id = req.params.animeId

	MALintent.getAnime(id)
		.then( anime => {
			const response = responseCreator.createResponse('Found', anime)

			res.send(StatusCodes.ok, response)
			res.end()
		}).catch( () => {
			const response = responseCreator.createError('Anime not found')

			res.send(StatusCodes.notFound, response)
			res.end()
		})
})

// Get users list
app.get('/mylist', function(req, res) {
	MALintent.getAnimeList(req.username)
		.then( result => {
			const response = responseCreator.createResponse('successful', result)

			res.send(StatusCodes.ok, response)
			res.end()
		}).catch( err => {
			const response = responseCreator.createError(err)
			res.send(response)
			res.end()
		})
})

// Get individual id from list
app.get('/mylist/:animeID', function(req, res) {

	MALintent.getAnimeList(req.username)
		.then( result => {
			const anime = result.filter(function(item) {
				if (item.malid === req.params.animeID) {
					return true
				}
				return false
			}).first()

			if (anime) {
				const response = responseCreator.createResponse('successful', anime)

				res.send(StatusCodes.ok, response)
			} else {
				const response = responseCreator.createError('This anime isn\'t in your list')

				res.send(StatusCodes.notFound, response)
			}
			res.end()
		}).catch( err => {
			const response = responseCreator.createError(err)

			res.send(response)
			res.end()
		})
})

// Add an anime to users mylist
app.post('/mylist', function(req, res) {

	const username = req.username
	const password = req.authorization.basic.password

	MALintent.addAnime(username, password, req.body)
		.then( result => {
			res.send(StatusCodes.created, result)
		}).catch( err => {
			if (err === MALintent.malsponse.alreadyAdded) {
				const response = responseCreator.createError('Already added')

				res.send(StatusCodes.badRequest, response)
				res.end()
			} else {
				const response = responseCreator.createError('Failed to add')

				res.send(StatusCodes.badRequest, response)
				res.end()
			}
		})
})

// Update an anime on a users mylist
app.put('/mylist', function(req, res) {

	const username = req.username
	const password = req.authorization.basic.password

	MALintent.updateAnime(username, password, req.body)
		.then( result => {
			res.send(StatusCodes.ok, result)
		}).catch( () => {
			const response = responseCreator.createError('Failed to update')
			
			res.send(StatusCodes.badRequest, response)
			res.end()
		})
})

// Set the port
const port = process.env.PORT || defaultPort

// Star the server
app.listen(port, function(err) {
	if (err) {
		console.error(err)
	} else {
		console.log('App is ready at : ' + port)
	}
})
