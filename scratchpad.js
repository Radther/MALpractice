'use strict'
/* eslint-disable */

// const print = require('./print').print
// const printAll = require('./print').printAll
const request = require("request")
const MALintent = require("./MALintent.js")
require('./extensions.js')
const cheerio = require('cheerio')
// const url = "https://myanimelist.net/anime/34277"
const xml2js = require('xml2js')

const username = 'unistudent'
const password = '+)}/wnP.G46D63TkUKq4'

MALintent.searchAnime(username, password, 'fate night', function() {
	
})