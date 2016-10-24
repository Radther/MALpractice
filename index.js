'use strict'

// Import
require('./extensions.js')
const rest = require('restify')
const responseCreator = require('./response-creator.js')
// const print = require('./print').print
const MALintent = require('./MALintent.js')

// Create Server
const app = rest.createServer()

// Setup
app.use(rest.fullResponse())
app.use(rest.bodyParser())
app.use(rest.authorizationParser())
app.use(rest.queryParser())

// Default Port
const defaultPort = 8080

// StatusCodes
const StatusCodes = {
	ok: 200,
	created: 201,
	accepted: 202,
	badRequest: 400,
	unauthorised: 401,
	notFound: 404
}

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
	MALintent.verifyUser(username, password, (malsponse, userid, username) => {
		switch (malsponse) {
		case MALintent.malsponse.unauthorised:
			const response = responseCreator.createError('Username or Password incorrect (or maybed the auth server is down)')
			res.send(StatusCodes.unauthorised, response)
			res.end()
			break
		case MALintent.malsponse.verified:
			req.userid = userid
			req.username = username
			next()
			break
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

	const parameter = req.params.q || req.params.query

	const data = {
		parameter: parameter
	}

	const response = responseCreator.createResponse('Search successful', data)
	res.send(StatusCodes.ok, response)
	return
})

// Get anime by MyAnimeList ID
app.get('/anime/:animeId', function(req, res) {
	if (!req.params.animeId) {
		const response = responseCreator.createError('missing anime id!')
		res.send(StatusCodes.badRequest, response)
	}

	const id = req.params.animeId
	const data = {
		animeId: id
	}

	const response = responseCreator.createResponse('Anime found', data)
	res.send(StatusCodes.ok, response)
})

// Get users list
app.get('/mylist', function(req, res) {
	MALintent.getAnimeList(req.username, function(result) {
		switch (result) {
		case MALintent.malsponse.unauthorised:
		case MALintent.malsponse.failedToParse:
		case MALintent.malsponse.failedToGetList:
			const response = responseCreator.createError(result)
			res.send(StatusCodes.badRequest, response)
			res.end()
			return
		}
		const response = responseCreator.createResponse('successful', result)
		res.send(StatusCodes.ok, response)
		res.end()
		return
	})
})

// Get individual id from list
app.get('/mylist/:animeID', function(req, res) {
	MALintent.getAnimeList(req.username, function(result) {
		switch (result) {
		case MALintent.malsponse.unauthorised:
		case MALintent.malsponse.failedToParse:
		case MALintent.malsponse.failedToGetList:
			const response = responseCreator.createError(result)
			res.send(StatusCodes.badRequest, response)
			res.end()
			return
		}
		const anime = result.filter(function(item) {
			if (item.malid === req.params.animeID) {
				return true
			}
			return false
		}).first()
		if (anime) {
			const response = responseCreator.createResponse('successful', anime)
			res.send(StatusCodes.ok, response)
			res.end()
		} else {
			const response = responseCreator.createError('Anime isn\'t in your list')
			res.send(StatusCodes.notFound, response)
			res.end()
		}
	})
})

// Add an anime to users mylist
app.post('/mylist/:animeID', function(req, res) {
	res.send('')
})

// Update an anime on a users mylist
app.put('/mylist/:animeID', function(req, res) {
	res.send('')
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
