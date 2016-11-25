'use strict'

const frisby = require('frisby')

const StatusCodes = require('../StatusCodes.js').StatusCodes

const uniUsername = 'unistudent'
const uniPassword = '+)}/wnP.G46D63TkUKq4'
const fakePassword = 'notARealPassword'
const userid = '5778142'

const baseUrl = 'http://localhost:8080'
const method = {
	anime: '/anime',
	mylist: '/mylist'
}

function createAuth(username, password) {
	return 'Basic ' + new Buffer(username + ':' + password).toString('base64')
}

frisby.globalSetup({
	request: {
		headers: {'Authorization': createAuth(uniUsername, uniPassword)}//, 'Content-Type': 'application/json'}
	}
})

frisby.create('authenticate user with correct details')
	.head(baseUrl+method.anime)
	.expectStatus(StatusCodes.ok)
	.toss()

frisby.create('search anime')
	.get(baseUrl+method.anime+'?q=fate')
	.expectStatus(StatusCodes.ok)
	.expectHeaderContains('Content-Type', 'application/json')
	.expectJSONTypes({
		status: String,
		message: String,
		data: Array
	})
	.toss()

frisby.create('get anime by id')
	.get(baseUrl+method.anime+'/1')
	.expectStatus(StatusCodes.ok)
	.expectHeaderContains('Content-Type', 'application/json')
	.expectJSONTypes({
		status: String,
		message: String,
		data: Object
	})
	.expectJSONTypes('data', {
		title: String,
		info: Object,
		episodes: String,
		description: String,
		score: String,
		rank: String,
		popularity: String,
		members: String,
		imageurl: String,
		malid: String
	})
	.toss()

frisby.create('get users list')
	.get(baseUrl+method.mylist)
	.expectStatus(StatusCodes.ok)
	.expectHeaderContains('Content-Type', 'application/json')
	.expectJSONTypes({
		status: String,
		message: String,
		data: Array
	})
	.expectJSONTypes('data.0', {
		malid: String,
		title: String,
		my_watch_status: Number,
		my_last_updated: Number,
		my_score: Number,
		series_type: Number,
		series_episodes: Number,
		series_image: String
	})
	.toss()

frisby.create('get sinlge anime from a users list')
	.get(baseUrl+method.mylist+'/1')
	.expectStatus(StatusCodes.ok)
	.expectHeaderContains('Content-Type', 'application/json')
	.expectJSONTypes({
		status: String,
		message: String,
		data: Object
	})
	.expectJSONTypes('data', {
		malid: String,
		title: String,
		my_watched_episodes: Number,
		my_watch_status: Number,
		my_last_updated: Number,
		my_score: Number,
		series_type: Number,
		series_episodes: Number,
		series_image: String
	})
	.toss()

frisby.create('update an anime on the list')
	.put(baseUrl+method.mylist, {
		malid: 1,
		status: 2,
		episode: 0
	}, {json: true})
	.inspectRequest()
	.expectStatus(StatusCodes.ok)
	.expectHeaderContains('Content-Type', 'application/json')
	.expectJSON({
		status: 'Success',
		message: 'updated'
	})
	.toss()
