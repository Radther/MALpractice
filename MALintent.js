'use strict'

require('./extensions.js')
const request = require('request')
const xml2js = require('xml2js')
const cheerio = require('cheerio')

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
	failedToGetList: 'failedToGetList',
	failedToParse: 'failedToParse',
	addedSuccessfully: 'addedSuccessfully',
	failedToAdd: 'failedToAdd',
	updatedSuccessfully: 'updatedSuccessfully',
	failedToUpdate: 'failedToUpdate',
	animeNotFound: 'animeNotFound',
	invalidSearch: 'invalidSearch'
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

const watchStatus = {
	1: 'Watching',
	2: 'Completed',
	3: 'On-Hold',
	4: 'Dropped',
	6: 'Plan to Watch'
}

exports.malsponse = malsponse

exports.verifyUser = function(username, password, completion) {
	const url = baseUrl+method.verify
	const auth = createAuth(username, password)
	request.get({
		url: url,
		headers: {
			'Authorization': auth
		}
	}, function(error, res, body) {
		if (error) {
			completion(malsponse.unauthorised)
			return
		}
		if (body === 'Invalid credentials') {
			completion(malsponse.unauthorised)
			return
		}
		xml2js.parseString(body, (err, result) => {
			if (err) {
				completion(malsponse.unauthorised)
				return
			}
			if (!result.user) {
				completion(malsponse.unauthorised)
				return
			}
			if (!result.user.id || !result.user.username) {
				completion(malsponse.unauthorised)
				return
			}
			if (result.user.id.first() && result.user.username.first()) {
				completion(malsponse.verified, result.user.id.first(), result.user.username.first())
				return
			}
		})
	})
}

exports.getAnimeList = function(username, completion) {
	const url = baseUrl+method.list.injectURLParam('username', username)
	request.get({
		url: url
	}, function(error, res, body) {
		if (error) {
			completion(malsponse.failedToGetList)
			return
		}
		xml2js.parseString(body, (err, result) => {
			if (err) {
				completion(malsponse.failedToParse)
				return
			}
			if (result.myanimelist.error) {
				completion(malsponse.unauthorised)
				return
			}
			const myanimelist = result.myanimelist
			if (!myanimelist) {
				completion(malsponse.failedToParse)
				return
			}
			const anime = myanimelist.anime
			if (!anime) {
				completion(malsponse.failedToParse)
				return
			}
			const animelist = []
			for (let i = anime.length - 1; i >= 0; i--) {
				const animeItem = anime[i]
				if (animeItem.series_animedb_id.first()) {
					const anime = {}
					anime.malid = animeItem.series_animedb_id.first()
					anime.title = animeItem.series_title.first() || '[title unknown]'
					anime.my_watched_episodes = animeItem.my_watched_episodes.first()
					const watch_status_code = Number(animeItem.my_status.first())
					anime.my_watch_status = watch_status_code
					anime.my_last_updated = animeItem.my_last_updated.first()
					anime.my_score = animeItem.my_score.first()
					animelist.push(anime)
				}
			}
			completion(animelist)
			return
		})
	})
}

exports.addAnime = function(username, password, animeData, completion) {
	const id = animeData.malid
	const xmlAnimeData = createAnimeXML(animeData)
	const encodedXMLAnimeData = encodeURIComponent(xmlAnimeData)
	const url = baseUrl+method.add
		.injectURLParam('id', id)
		.concat('?data=')
		.concat(encodedXMLAnimeData)

	url.print()

	const auth = createAuth(username, password)
	request.get({
		url: url,
		headers: {
			'Authorization': auth
		}
	}, function(error, res) {
		if (error) {
			completion(malsponse.failedToAdd)
			return
		}
		const successCode = 201
		if (res.statusCode !== successCode) {
			completion(malsponse.failedToAdd)
			return
		}
		completion(malsponse.addedSuccessfully)
		return
	})
}

exports.updateAnime = function(username, password, animeData, completion) {
	const id = animeData.malid
	const xmlAnimeData = createAnimeXML(animeData)
	const encodedXMLAnimeData = encodeURIComponent(xmlAnimeData)
	const url = baseUrl+method.update
		.injectURLParam('id', id)
		.concat('?data=')
		.concat(encodedXMLAnimeData)

	const auth = createAuth(username, password)
	request.get({
		url: url,
		headers: {
			'Authorization': auth
		}
	}, function(error, res) {
		if (error) {
			completion(malsponse.failedToUpdate)
			return
		}
		const successCode = 200
		res.statusCode.print()
		if (res.statusCode !== successCode) {
			completion(malsponse.failedToUpdate)
			res.statusCode.print()
			return
		}
		completion(malsponse.updatedSuccessfully)
		return
	})
}

exports.getAnime = function(animeID, completion) {
	const url = baseUrl+method.get
		.injectURLParam('id', animeID)

	request.get({
		url: url
	}, function(error, res) {
		if (error) {
			completion(malsponse.animeNotFound)
			return
		}
		const $ = cheerio.load(res.body, {decodeEntities: false})
		if (!($('.error404').text().trim().replace(/\s\s+/g, ' ') === '')) {
			completion(malsponse.animeNotFound)
			return
		}
		try {
			const anime = {}

			anime.title = $('h1').text()
			anime.info = {}

			$('span[class^="dark_text"]').parent().each(function(index, elem) {
				const data = $(elem).children('span').text().replace(':','')
				$(elem).children('span').remove()
				$(elem).children('.statistics-info').remove()
				const item = $(elem).text().trim().replace(/\s\s+/g, ' ').replace(', add some', '')
				anime.info[data] = item
			})

			anime.description = $('span[itemprop^="description"]').text()
			anime.score = $('.score').text().trim().replace(/\s\s+/g, ' ')
			anime.rank = $('.numbers.ranked').children('strong').text().trim().replace(/\s\s+/g, ' ')
			anime.popularity = $('.numbers.popularity').children('strong').text().trim().replace(/\s\s+/g, ' ')
			anime.members = $('.numbers.members').children('strong').text().trim().replace(/\s\s+/g, ' ')

			anime.imageurl = $('[itemprop^="image"]').attr('src')

			completion(anime)
		} catch(error) {
			completion(malsponse.animeNotFound)
		}
	})
}

exports.searchAnime = function(username, password, query, completion) {
	const url = baseUrl+method.search
		.injectURLParam('query', query)
	const auth = createAuth(username, password)

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
			try {
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
				completion(animes)
				return
			} catch (error) {
				completion(malsponse.invalidSearch)
				return
			}
		})
	})

}

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
