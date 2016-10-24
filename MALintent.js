'use strict'

require('./extensions.js')
const request = require('request')
// const print = require('./print').print
const xml2js = require('xml2js')

const baseUrl = 'https://myanimelist.net'
const method = {
	search: '/api/anime/search.xml',
	add: '/api/animelist/add/{id}.xml',
	update: '/api/animelist/update/{id}.xml',
	delete: '/api/animelist/delete/{id}.xml',
	verify: '/api/account/verify_credentials.xml',
	list: '/malappinfo.php?u={username}&status=all&type=anime'
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
					animelist.push({
						malid: animeItem.series_animedb_id.first(),
						title: animeItem.series_title.first() || '[title unknown]'
					})
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

	url.print()

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
