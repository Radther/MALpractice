'use strict'

require('./extensions.js')
const request = require('request')
const xml2js = require('xml2js')
const cheerio = require('cheerio')

const requestp = require('request-promise')
const xml2jsp = require('xml2js-es6-promise')
const StatusCodes = require('./StatusCodes.js').StatusCodes

const baseUrl = 'https://myanimelist.net'
const method = {
	search: '/api/anime/search.xml?q={query}',
	add: '/api/animelist/add/{id}.xml',
	update: '/api/animelist/update/{id}.xml',
	delete: '/api/animelist/delete/{id}.xml',
	verify: '/api/account/verify_credentials.xml',
	list: '/malappinfo.php?u={username}&status=all&type=anime',
	get: '/anime/{id}'
}

const malsponse = {
	unauthorised: 'unauthorised',
	verified: 'verified',
	notFound: 'notFound',
	unhandled: 'unhandled',
	addedSuccessfully: 'addedSuccessfully',
	failedToAdd: 'failedToAdd',
	alreadyAdded: 'alreadyAdded',
	updatedSuccessfully: 'updatedSuccessfully',
	failedToUpdate: 'failedToUpdate',
	animeNotFound: 'animeNotFound'
}

const animeXMLObject =
	'<?xml version="1.0" encoding="UTF-8"?>'+
	'<entry>' +
		'<episode>{episode}</episode>' +
		'<status>{status}</status>' +
		'<score>{score}</score>' +
		'<storage_type>{storage_type}</storage_type>' +
		'<storage_value>{storage_value}</storage_value>' +
		'<times_rewatched>{times_rewatched}</times_rewatched>' +
		'<rewatch_value>{rewatch_value}</rewatch_value>' +
		'<date_start>{date_start}</date_start>' +
		'<date_finish>{date_finish}</date_finish>' +
		'<priority>{priority}</priority>' +
		'<enable_discussion>{enable_discussion}</enable_discussion>' +
		'<enable_rewatching>{enable_rewatching}</enable_rewatching>' +
		'<comments>{comments}</comments>' +
		'<fansub_group>{fansub_group}</fansub_group>' +
		'<tags>{tags}</tags>' +
	'</entry>'

const animeXMLObjectParams = {
	episode: 'episode',
	status: 'status',
	score: 'score',
	storage_type: 'storage_type',
	storage_value: 'storage_value',
	times_rewatched: 'times_rewatched',
	rewatch_value: 'rewatch_value',
	date_start: 'date_start',
	date_finish: 'date_finish',
	priority: 'priority',
	enable_discussion: 'enable_discussion',
	enable_rewatching: 'enable_rewatching',
	comments: 'comments',
	fansub_group: 'fansub_group',
	tags: 'tags'
}

exports.malsponse = malsponse

exports.verifyUser = function(username, password) {
	return new Promise(function(resolve, reject) {
		runAuthRequest(username, password)
			.then(rejectBadStatusCode)
			.then(extractBody)
			.then(parseXml)
			.then(parseAuthentication)
			.then( data => {
				resolve(data)
			}).catch( err => {
				reject(err)
			})
	})
}

exports.searchAnime = function(username, password, query) {
	return new Promise(function(resolve, reject) {
		runSearchRequest(username, password, query)
			.then(rejectBadStatusCode)
			.then(extractBody)
			.then(parseXml)
			.then(parseSearchAnime)
			.then( animes => {
				resolve(animes)
			}).catch( err => {
				reject(err)
			})
	})
}

exports.getAnimeList = function(username) {
	return new Promise(function(resolve, reject) {
		runGetUserAnimeRequest(username)
			.then(rejectBadStatusCode)
			.then(extractBody)
			.then(parseXml)
			.then(parseMyListAnime)
			.then( animes => {
				resolve(animes)
			}).catch( err => {
				reject(err)
			})
	})
}

exports.addAnime = function(username, password, animeData) {
	return new Promise(function(resolve, reject) {
		runAddAnimeRequest(username, password, animeData)
			.then(parseAddAnime)
			.then( result => {
				resolve(result)
			}).catch( err => {
				reject(err)
			})
	})
}

exports.updateAnime = function(username, password, animeData) {
	return new Promise(function(resolve, reject) {
		runUpdateAnimeRequest(username, password, animeData)
			.then(parseUpdateAnime)
			.then( result => {
				resolve(result)
			}).catch( err => {
				reject(err)
			})
	})
}

exports.getAnime = function(animeID) {
	return new Promise(function(resolve, reject) {
		runGetAnimeRequest(animeID)
			.then(extractBody)
			.then(parseAnimePage)
			.then( anime => {
				resolve(anime)
			}).catch( err => {
				reject(err)
			})
	})
}

// Run
function runRequest(options) {
	return new Promise(function(resolve, reject) {
		options.
			resolveWithFullResponse = true
		options.simple = false
		requestp.get(options)
			.then( result => {
				resolve(result)
			}).catch( err => {
				reject(err.statusCode)
			})
	})
}

var runAuthRequest = function(username, password) {
	return new Promise(function(resolve, reject) {
		const url = baseUrl+method.verify
		const auth = createAuth(username, password)
		const urlOptions = {
			url: url,
			headers: {
				'Authorization': auth
			}
		}

		runRequest(urlOptions)
			.then( result => {
				resolve(result)
			}).catch( err => {
				reject(err)
			})
	})
}

var runSearchRequest = function(username, password, search) {
	return new Promise(function(resolve, reject) {
		const url = baseUrl+method.search
			.injectURLParam('query', encodeURIComponent(search))
		const auth = createAuth(username, password)
		const urlOptions = {
			url: url,
			headers: {
				'Authorization': auth
			}
		}

		runRequest(urlOptions)
			.then( result => {
				if (result.statusCode === StatusCodes.noContent) {
					reject(StatusCodes.noContent)
				}
				resolve(result)
			}).catch( err => {
				reject(err)
			})
	})
}

var runGetUserAnimeRequest = function(username) {
	return new Promise(function(resolve, reject) {
		const url = baseUrl+method.list
			.injectURLParam('username', username)
		const urlOptions = {
			url: url
		}

		runRequest(urlOptions)
			.then( result => {
				if (result.statusCode === StatusCodes.noContent) {
					reject(StatusCodes.noContent)
				}
				resolve(result)
			}).catch( err => {
				reject(err)
			})
	})
}

var runAddAnimeRequest = function(username, password, animeData) {
	return new Promise(function(resolve, reject) {
		const xmlData = createAnimeXML(animeData)
		const encodedXmlData = encodeURIComponent(xmlData)

		const url = baseUrl+method.add
			.injectURLParam('id', animeData.malid)
			.concat('?data=')
			.concat(encodedXmlData)

		const auth = createAuth(username, password)
		const urlOptions = {
			url: url,
			headers: {
				'Authorization': auth
			}
		}

		runRequest(urlOptions)
			.then( result => {
				resolve(result)
			}).catch( err => {
				reject(err)
			})
	})
}

var runUpdateAnimeRequest = function(username, password, animeData) {
	return new Promise(function(resolve, reject) {
		const xmlData = createAnimeXML(animeData)
		const encodedXmlData = encodeURIComponent(xmlData)

		const url = baseUrl+method.update
			.injectURLParam('id', animeData.malid)
			.concat('?data=')
			.concat(encodedXmlData)

		const auth = createAuth(username, password)

		const urlOptions = {
			url: url,
			headers: {
				'Authorization': auth
			}
		}

		runRequest(urlOptions)
			.then( result => {
				resolve(result)
			}).catch( err => {
				reject(err)
			})
	})
}

var runGetAnimeRequest = function(animeID) {
	return new Promise(function(resolve, reject) {
		const url = baseUrl+method.get
			.injectURLParam('id', animeID)

		const urlOptions = {
			url: url
		}

		runRequest(urlOptions)
			.then( result => {
				resolve(result)
			}).catch( err => {
				reject(err)
			})
	})
}

// Reject
function rejectBadStatusCode(result) {
	return new Promise(function(resolve, reject) {
		if (result.statusCode>=StatusCodes.multipleChoices || result.statusCode<StatusCodes.ok) {
			const data = result.statusCode
			reject(data)
		} else {
			resolve(result)
		}
	})
}

// Extract
function extractBody(result) {
	return new Promise(function(resolve, reject) {
		try {
			resolve(result.body)
		} catch (error) {
			reject(error)
		}
	})
}

// Parse
function parseXml(xml) {
	return new Promise(function(resolve, reject) {
		xml2jsp(xml)
			.then( json => {
				resolve(json)
			}).catch( () => {
				reject(malsponse.failedToParse)
			})
	})
}

function parseAuthentication(json) {
	return new Promise(function(resolve, reject) {
		try {
			const data = {
				response: malsponse.verified,
				userid: json.user.id.first(),
				username: json.user.username.first()
			}
			resolve(data)
		} catch (error) {
			reject(malsponse.failedToParse)
		}
	})
}

function parseSearchAnime(json) {
	return new Promise(function(resolve, reject) {
		try {
			const animes = []
			for (const item of json.anime.entry) {
				const anime = {}
				if (!item.id.first()) {
					continue
				}
				anime.malid = item.id.first()
				anime.title = item.title.first() !== undefined && item.title.first() !== ''? item.title.first() : '[title unknown]'
				anime.episodes = item.episodes.first() !== undefined && Number(item.episodes.first()) !== 0 ? item.episodes.first() : '???'
				anime.score = item.score.first() !== undefined && item.score.first() !== '0.00' ? item.score.first() : 'N/A'
				anime.type = item.type.first() !== undefined && item.type.first() !== '' ? item.type.first() : 'Unknown'
				anime.air_status = item.status.first() !== undefined && item.status.first() !== '' ? item.status.first() : 'Unknown'
				anime.imageurl = item.image.first() !== undefined && item.image.first() !== '' ? item.image.first() : ''

				animes.push(anime)
			}
			resolve(animes)
		} catch (error) {
			reject(malsponse.failedToParse)
		}
	})
}

function parseMyListAnime(json) {
	return new Promise(function(resolve, reject) {
		try {
			const animes = []
			if (!json.myanimelist.anime) {
				reject(StatusCodes.noContent)
			}
			for(const item of json.myanimelist.anime) {
				const anime = {}
				anime.malid = item.series_animedb_id.first()
				anime.title = item.series_title.first() || '[title unknown]'
				anime.my_watched_episodes = Number(item.my_watched_episodes.first())
				const watch_status_code = Number(item.my_status.first())
				anime.my_watch_status = watch_status_code
				anime.my_last_updated = Number(item.my_last_updated.first())
				anime.my_score = Number(item.my_score.first())
				animes.push(anime)
			}
			resolve(animes)
		} catch (error) {
			reject(malsponse.failedToParse)
		}
 	})
}

function parseAddAnime(result) {
	return new Promise(function(resolve, reject) {
		if (result.statusCode === StatusCodes.created) {
			resolve(malsponse.addedSuccessfully)
		} else if (result.body.includes('is already in the list')) {
			reject(malsponse.alreadyAdded)
		} else {
			reject(malsponse.failedToAdd)
		}
	})
}

function parseUpdateAnime(result) {
	return new Promise(function(resolve, reject) {
		if (result.statusCode === StatusCodes.ok) {
			resolve(malsponse.updatedSuccessfully)
		} else {
			reject(malsponse.failedToUpdate)
		}
	})
}

function parseAnimePage(page) {
	return new Promise(function(resolve, reject) {
		try {
			const $ = cheerio.load(page, {decodeEntities: false})
			if (!($('.error404').text().trim().replace(/\s\s+/g, ' ') === '')) {
				reject(malsponse.animeNotFound)
			}
			const anime = {}

			anime.title = $('h1').text()
			anime.info = {}

			$('span[class^="dark_text"]').parent().each(function(index, elem) {
				const data = $(elem).children('span').text().replace(':','')
				$(elem).children('span').remove()
				$(elem).children('.statistics-info').remove()
				const item = $(elem).text().trim().replace(/\s\s+/g, ' ').replace(', add some', '')
				anime.info[data] = item
				if (data === 'Episodes') {
					anime.episodes = item
				}
			})

			anime.description = $('span[itemprop^="description"]').text()
			anime.score = $('.score').text().trim().replace(/\s\s+/g, ' ')
			anime.rank = $('.numbers.ranked').children('strong').text().trim().replace(/\s\s+/g, ' ')
			anime.popularity = $('.numbers.popularity').children('strong').text().trim().replace(/\s\s+/g, ' ')
			anime.members = $('.numbers.members').children('strong').text().trim().replace(/\s\s+/g, ' ')

			anime.imageurl = $('[itemprop^="image"]').attr('src')

			resolve(anime)
		} catch (error) {
			reject(malsponse.animeNotFound)
		}
	})
}

// Create
function createAuth(username, password) {
	return 'Basic ' + new Buffer(username + ':' + password).toString('base64')
}

function createAnimeXML(animeData) {
	const xmlAnimeData =
		animeXMLObject
			.injectXMLParam(animeXMLObjectParams.episode, animeData.episode)
			.injectXMLParam(animeXMLObjectParams.status, animeData.status)
			.injectXMLParam(animeXMLObjectParams.score, animeData.score)
			.injectXMLParam(animeXMLObjectParams.storage_type, animeData.storage_type)
			.injectXMLParam(animeXMLObjectParams.storage_value, animeData.storage_value)
			.injectXMLParam(animeXMLObjectParams.times_rewatched, animeData.times_rewatched)
			.injectXMLParam(animeXMLObjectParams.rewatch_value, animeData.rewatch_value)
			.injectXMLParam(animeXMLObjectParams.date_start, animeData.date_start)
			.injectXMLParam(animeXMLObjectParams.date_finish, animeData.date_finish)
			.injectXMLParam(animeXMLObjectParams.priority, animeData.priority)
			.injectXMLParam(animeXMLObjectParams.enable_discussion, animeData.enable_discussion)
			.injectXMLParam(animeXMLObjectParams.enable_rewatching, animeData.enable_rewatching)
			.injectXMLParam(animeXMLObjectParams.comments, animeData.comments)
			.injectXMLParam(animeXMLObjectParams.fansub_group, animeData.fansub_group)
			.injectXMLParam(animeXMLObjectParams.tags, animeData.tags)

	return xmlAnimeData
}
