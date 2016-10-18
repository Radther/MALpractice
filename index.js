'use strict'

// Import
const rest = require('restify')
const responseCreator = require('./response-creator.js')
const print = require('./print').print
const printAll = require('./print').printAll
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
	ok : 200,
	created: 201,
	accepted: 202,
	badRequest: 400,
	unauthorised: 401,
	notFound: 404
}

// Custom middleware
app.use(function(req, res, next) {
	if (!req.authorization.basic) {
		let response = responseCreator.createError("basic auth not provided")
		res.send(StatusCodes.unauthorised, response)
		res.end()
	}
	let username = req.username
	let password = req.authorization.basic.password
	if (!username || !password) {
		let response = responseCreator.createError("missing username or password")
		res.send(StatusCodes.unauthorised, response)
		res.end()
	}
	MALintent.verifyUser(username, password, (malsponse, userid, username) => {
		switch (malsponse) {
		case MALintent.malsponse.unauthorised:
			let response = responseCreator.createError("Username or Password incorrect (or maybed the auth server is down)")
			print(response)
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
	let response = responseCreator.createResponse("Verification Successful", {
		userid: req.userid,
		username: req.username
	})
	res.send(StatusCodes.ok, response)
})

// Anime collection (Requires 'q' parameter)
app.get('/anime', function(req, res) {
	if (!req.params.q && !req.params.query) {
		let response = responseCreator.createError("'query' or 'q' parameter required")
		res.send(StatusCodes.badRequest, response)
		return
	}

	let parameter = req.params.q || req.params.query

	let data = {
		parameter: parameter
	}

	let response = responseCreator.createResponse("Search successful", data)
	res.send(StatusCodes.ok, response)
	return
})

// Get anime by MyAnimeList ID
app.get('/anime/:animeId', function(req, res) {
	if (!req.params.animeId) {
		let response = responseCreator.createError("missing anime id!")
		res.send(StatusCodes.badRequest, response)
	}

	let id = req.params.animeId
	let data = {
		animeId: id
	}

	let response = responseCreator.createResponse("Anime found", data)
	res.send(StatusCodes.ok, response)
})

// Add an anime to users list
app.post('/anime', function(req, res) {
	res.send("")
})

// Update an anime on a users list
app.put('/anime', function(req, res) {
	res.send("")
})

// Get users list
app.get('/mylist', function(req, res) {
	res.send("")
})

// Get individual id from list
app.get('/mylist/:animeID', function(req, res) {
	res.send("")
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