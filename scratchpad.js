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

// request.get({
// 	url: url
// }, function(error, response, request) {
// 	const $ = cheerio.load(response.body, {decodeEntities: false})

// 	let four = $('.error404').text().trim().replace(/\s\s+/g, ' ') == ''
// 	four.print()


// })
// 
const url = 'https://myanimelist.net/api/anime/search.xml?q=hey'
const auth = 'Basic ' + new Buffer('unistudent' + ':' + '+)}/wnP.G46D63TkUKq4').toString('base64')
request.get({
	url: url,
	headers: {
			'Authorization': auth
		}
}, function(error, res, body) {
	if (error) {
		completion(malsponse.invalidSearch)
		return
	}
	xml2js.parseString(body, (err, result) => {
		if (err) {
			completion(malsponse.invalidSearch)
			return
		}
		if (!result.anime) {
			completion(malsponse.invalidSearch)
			return
		}
		const animes = []
		for (const item of result.anime.entry) {
			const anime = {}
			anime.title = item.title.first() !== undefined && item.title.first() !== ''? item.title.first() : '[title unknown]'
			anime.episodes = item.episodes.first() !== undefined && item.episodes.first() != '0' ? item.episodes.first() : '???'
			anime.score = item.score.first() !== undefined && item.score.first() != '0.00' ? item.score.first() : 'N/A'
			anime.type = item.type.first() !== undefined && item.type.first() != '' ? item.type.first() : 'Unknown'
			anime.air_status = item.status.first() !== undefined && item.status.first() != '' ? item.status.first() : 'Unknown'
			anime.imageurl = item.image.first() !== undefined && item.image.first() != '' ? item.image.first() : ''

			animes.push(anime)
		}
		animes.print()
		return
	})
})