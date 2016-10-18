'use strict'

const request = require("request")
const print = require('./print').print
const printAll = require('./print').printAll
const xml2js = require('xml2js')

const baseUrl = 'https://myanimelist.net/api'
const method = {
	search: "/anime/search.xml",
	add: "/animelist/add/{id}.xml",
	update: "/animelist/update/{id}.xml",
	delete: "/animelist/delete/{id}.xml",
	verify: "/account/verify_credentials.xml"
}

const malsponse = {
	unauthorised: "unauthorised",
	verified: "verified"
}

exports.malsponse = malsponse

exports.verifyUser = function(username, password, completion) {
	print("verifying user")
	let url = baseUrl+method.verify
	let auth = "Basic " + new Buffer(username + ":" + password).toString("base64")
	request.get({
		url: url,
		headers: {
			"Authorization" : auth
		}
	}, function (error, response, body) {
		if (error) {
			completion(malsponse.unauthorised)
		}
		if (body == "Invalid credentials") {
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
			if (result.user.id[0] && result.user.username[0]) {
				completion(malsponse.verified, result.user.id[0], result.user.username[0])
				return
			}
		})
	})
}

exports.getAnimeList = function(username) {
	
}