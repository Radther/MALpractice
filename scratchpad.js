'use strict'
/* eslint-disable */

// const print = require('./print').print
// const printAll = require('./print').printAll
const request = require("request")
const MALintent = require("./MALintent.js")
require('./extensions.js')
const cheerio = require('cheerio')
const url = "https://myanimelist.net/anime/34277"

request.get({
	url: url
}, function(error, response, request) {
	const $ = cheerio.load(response.body, {decodeEntities: false})
	let name = $('h1').text().print()
	$('span[class^="dark_text"]').text().print()
})