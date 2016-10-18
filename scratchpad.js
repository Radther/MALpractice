'use strict'

const print = require('./print').print
const printAll = require('./print').printAll
const request = require("request")

const baseUrl = 'https://myanimelist.net/api'
const method = {
	search: "/anime/search.xml",
	add: "/animelist/add/{id}.xml",
	update: "/animelist/update/{id}.xml",
	delete: "/animelist/delete/{id}.xml",
	verify: "/account/verify_credentials.xml"
}

print("verifying user")
	let url = baseUrl+method.verify
	print(url)
	let auth = "Basic " + new Buffer("radther" + ":" + "notarealpass").toString("base64")
	print(auth)
	request.get({
		url: url,
		headers: {
			"Authorization" : auth
		}
	}, function (error, response, body) {
		printAll([body, response, error])
	})

	// request.get("https://google.com",
	// 	(err, res, body) => {
	// 		print(body)
	// 		print(res)
	// 		print(err)
	// 	}
	// )