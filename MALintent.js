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
	failedToParse: 'failedToParse'
}

exports.malsponse = malsponse

exports.verifyUser = function(username, password, completion) {
	const url = baseUrl+method.verify
	const auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64')
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

String.prototype.injectURLParam = function(paramName, item) {
	const replaceString = `{${paramName}}`
	return this.replace(replaceString, item)
}
