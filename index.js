'use strict'

// Import
const rest = require('restify')

// Create Server
const app = rest.createServer()

// Setup
app.use(rest.fullResponse())
app.use(rest.bodyParser())
app.use(rest.authorizationParser())
app.use(rest.queryParser())

// Default Port
const defaultPort = 8080

// Routes
// Redirect to anime
app.get('/', function(req, res, next) {
	res.redirect('/anime', next)
})

// Anime collection (Requires 'q' parameter)
app.get('/anime', function(req, res) {
	console.log(req.params.q)
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