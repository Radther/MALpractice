'use strict'

require('./extensions.js')
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
	deletedSuccessfully: 'deletedSuccessfully',
	failedToUpdate: 'failedToUpdate',
	failedToDelete: 'failedToDelete',
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

/**
 * Verifies a users details
 * @param  {String} username the users username
 * @param  {String} password the users password
 * @return {Promise}          a promise that resolves the auth data
 */
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

/**
 * Searches anime on the MAL website
 * @param  {String} username the users username
 * @param  {String} password the users password
 * @param  {String} query    the query string to look for
 * @return {Promise}          a promise that resolves a list of anime
 */
exports.searchAnime = function(username, password, query) {
	return new Promise(function(resolve, reject) {
		runSearchRequest(username, password, query)
			.then(rejectBadStatusCode)
			.then(extractBody)
			.then(parseXml)
			.then(parseSearchAnime)
			.then(hateifyAnimes)
			.then( animes => {
				resolve(animes)
			}).catch( err => {
				reject(err)
			})
	})
}

/**
 * Gets a users list
 * @param  {String} username the users username
 * @return {Promise}          a promise that resolves a list of anime
 */
exports.getAnimeList = function(username) {
	return new Promise(function(resolve, reject) {
		runGetUserAnimeRequest(username)
			.then(rejectBadStatusCode)
			.then(extractBody)
			.then(parseXml)
			.then(parseMyListAnime)
			.then(hateifyAnimes)
			.then( animes => {
				resolve(animes)
			}).catch( err => {
				reject(err)
			})
	})
}

/**
 * Add an anime to a users list
 * @param {String} username  the users username
 * @param {String} password  the users password
 * @param {JSON} animeData  the anime data to add
 * @return {Promise}		  a promise that resolves the success
 */
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

/**
 * Update an anime on a users list
 * @param  {String} username  the users username
 * @param  {String} password  the users password
 * @param  {JSON} animeData the anime data to update
 * @return {Promise}           a promise that resolves the success
 */
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

/**
 * Get a single anime
 * @param  {String} animeID the id of the anime to get
 * @return {Promise}         a promise that resolves the anime data
 */
exports.getAnime = function(animeID) {
	return new Promise(function(resolve, reject) {
		runGetAnimeRequest(animeID)
			.then(extractBody)
			.then(parseAnimePage)
			.then( anime => {
				anime.malid = animeID
				return anime
			}).then( anime => {
				resolve(hateifyAnime(anime))
			}).catch( err => {
				reject(err)
			})
	})
}

exports.deleteAnime = function(username, password, animeID) {
	return new Promise(function(resolve) {
		runDeleteAnimeRequest(username, password, animeID)
			.then(parseDeleteAnime)
			.then( result => {
				resolve(result)
			}).catch()
	})
}

/**
 * Runs a request based on the options given
 * @param  {JSON} options the options of the request
 * @return {Promise}         a promise that resolves the result of the request
 */
function runRequest(options) {
	return new Promise(function(resolve) {
		options.
			resolveWithFullResponse = true
		options.simple = false
		requestp.get(options)
			.then( result => {
				resolve(result)
			}).catch()
	})
}

/**
 * Run an authentication request
 * @param  {String} username the users username
 * @param  {String} password the users password
 * @return {Promise}          a promise that resolves the auth data
 */
let runAuthRequest = function(username, password) {
	return new Promise(function(resolve) {
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
			})
	})
}

/**
 * Run a search request
 * @param  {String} username the users username
 * @param  {String} password the users password
 * @param  {String} search   the search query
 * @return {Promise}          a promise that resolves the search data
 */
let runSearchRequest = function(username, password, search) {
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
			})
	})
}

/**
 * Runs a user list request
 * @param  {String} username the users username
 * @return {Promise}          a promise that resolves the users list
 */
let runGetUserAnimeRequest = function(username) {
	return new Promise(function(resolve) {
		const url = baseUrl+method.list
			.injectURLParam('username', username)
		const urlOptions = {
			url: url
		}

		runRequest(urlOptions)
			.then( result => {
				resolve(result)
			})
	})
}

/**
 * Runs the add anime request
 * @param  {String} username the users username
 * @param  {String} password the users password
 * @param  {JSON} animeData the details of the anime to add
 * @return {Promise}           a promise that resolves the success of the operation
 */
let runAddAnimeRequest = function(username, password, animeData) {
	return new Promise(function(resolve) {
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
			})
	})
}

/**
 * Runs the update anime request
 * @param  {String} username the users username
 * @param  {String} password the users password
 * @param  {JSON} animeData the details of the anime to update
 * @return {Promise}           a promise that resolves the success of the operation
 */
let runUpdateAnimeRequest = function(username, password, animeData) {
	return new Promise(function(resolve) {
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
			})
	})
}

/**
 * Run get anime details request
 * @param  {String} animeID the animes ID
 * @return {Promise}         a promise that resolves the anime data
 */
let runGetAnimeRequest = function(animeID) {
	return new Promise(function(resolve) {
		const url = baseUrl+method.get
			.injectURLParam('id', animeID)

		const urlOptions = {
			url: url
		}

		runRequest(urlOptions)
			.then( result => {
				resolve(result)
			})
	})
}

/**
 * Run delete anime request
 * @param  {string} username the users username
 * @param  {string} password the users password
 * @param  {string} animeID  the animes id
 * @return {Promise}          a promise that resolves the success state
 */
let runDeleteAnimeRequest = function(username, password, animeID) {
	return new Promise(function(resolve) {
		const url = baseUrl+method.delete
			.injectURLParam('id', animeID)

		const auth = createAuth(username, password)

		const urlOptions = {
			url: url,
			headers: {
				'Authorization': auth
			}
		}

		urlOptions.
			resolveWithFullResponse = true
		urlOptions.simple = false

		requestp.delete(urlOptions)
			.then( result => {
				resolve(result)
			})
	})
}

/**
 * Rejects the result if the status code is bad
 * @param  {JSON} result result of a request
 * @return {Promise}        a promise that resolves the result if it has a good status code
 */
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

/**
 * Extracts the body from a request
 * @param  {JSON} result the request object
 * @return {Promise}        a promise that resolves the requests body
 */
function extractBody(result) {
	return new Promise(function(resolve) {
		resolve(result.body)
	})
}

/**
 * Turns XML data into JSON
 * @param  {String} xml string representation of XML data
 * @return {Promise}     a promise that resolves the JSON representation of the passed in XML
 */
function parseXml(xml) {
	return new Promise(function(resolve) {
		xml2jsp(xml)
			.then( json => {
				resolve(json)
			})
	})
}

/**
 * Parses authentication data
 * @param  {JSON} json json data of authentication
 * @return {Promise}      a promise that resolves a neater version of the authentication data
 */
function parseAuthentication(json) {
	return new Promise(function(resolve) {
		const data = {
			response: malsponse.verified,
			userid: json.user.id.first(),
			username: json.user.username.first()
		}

		resolve(data)
	})
}

/**
 * Parses search anime data
 * @param  {JSON} json search data from a search request
 * @return {Promise}      a promise that resolves a neater version of the search data
 */
function parseSearchAnime(json) {
	return new Promise(function(resolve) {
		const animes = []

		for (const item of json.anime.entry) {
			const anime = {}

			anime.malid = item.id.first()
			anime.title = item.title.first()
			anime.episodes = item.episodes.first() !== undefined && Number(item.episodes.first()) !== 0 ? item.episodes.first() : '???'
			anime.score = item.score.first() !== undefined && item.score.first() !== '0.00' ? item.score.first() : 'N/A'
			anime.type = item.type.first()
			anime.air_status = item.status.first()
			anime.imageurl = item.image.first()

			animes.push(anime)
		}
		resolve(animes)
	})
}

/**
 * Parses a users list data
 * @param  {JSON} json user list data
 * @return {Promise}      a promise that resolves a neater version of the list data
 */
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
				anime.title = item.series_title.first()
				anime.my_watched_episodes = Number(item.my_watched_episodes.first())

				const watch_status_code = Number(item.my_status.first())

				anime.my_watch_status = watch_status_code
				anime.my_last_updated = Number(item.my_last_updated.first())
				anime.my_score = Number(item.my_score.first())
				anime.series_type = Number(item.series_type.first())
				anime.series_episodes = Number(item.series_episodes.first())
				anime.series_image = item.series_image.first()
				animes.push(anime)
			}
			resolve(animes)
		} catch (error) {
			reject(malsponse.failedToParse)
		}
 	})
}

/**
 * Parses the data from an add anime request
 * @param  {JSON} result the data from an add anime request
 * @return {Promise}        a promise that resolves a neater version of the add anime data
 */
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

/**
 * Parses the data from an update anime request
 * @param  {JSON} result the data from an update anime request
 * @return {Promise}        a promise that resolves a neater version of the update anime data
 */
function parseUpdateAnime(result) {
	return new Promise(function(resolve, reject) {
		if (result.statusCode === StatusCodes.ok) {
			resolve(malsponse.updatedSuccessfully)
		} else {
			reject(malsponse.failedToUpdate)
		}
	})
}

/**
 * Parses the data from a delete anime request
 * @param  {JSON} result the data from a delete anime request
 * @return {Promise}        a promise that resolves a neater version of the delete anime data
 */
function parseDeleteAnime() {
	return new Promise(function(resolve) {
		resolve(malsponse.deletedSuccessfully)
	})
}

/**
 * Parses the data from a get anime page request
 * @param  {HTML} page the HTML of an anime page
 * @return {Promise}      a promise that resolves JSON data extracted from the page
 */
function parseAnimePage(page) {
	return new Promise(function(resolve, reject) {
		const $ = cheerio.load(page, {decodeEntities: false})

		if (!($('.error404').text().trim().replace(/\s\s+/g, ' ') === '')) {
			reject(malsponse.animeNotFound)
		}
		const anime = {}

		anime.title = $('h1').text()
		anime.info = {}

		$('span[class^="dark_text"]').parent().each(function(index, elem) {
			const data = $(elem).children('span[class^="dark_text"]').text().replace(':','')

			$(elem).children('span[class^="dark_text"]').remove()
			$(elem).children('.statistics-info').remove()
			$(elem).children('sup').remove()
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
	})
}

/**
 * Adds HATEOAS to a list of animu
 * @param  {Array} animes list of anime objects
 * @return {Promise}        a promise that resolves the HATEOAS-ified anime
 */
function hateifyAnimes(animes) {
	return new Promise(function(resolve) {
		resolve(animes.map(hateifyAnime))
	})
}

/**
 * Add HATEOAS to an anime
 * @param  {Object} anime the anime to add to
 * @return {Object}      the updated anime
 */
function hateifyAnime(anime) {
	anime._links = {}
	anime._links.self = `{host}/anime/${anime.malid}`
	return anime
}

/**
 * Create an auth string from the users details
 * @param  {String} username the users username
 * @param  {String} password the users password
 * @return {String}			encoded string
 */
function createAuth(username, password) {
	return 'Basic ' + new Buffer(username + ':' + password).toString('base64')
}

/**
 * Create XML data from anime JSON
 * @param  {JSON} animeData the json data to be converted to XML
 * @return {XML}           XML data from the JSON data
 */
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
