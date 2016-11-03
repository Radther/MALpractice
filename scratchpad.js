'use strict'
/* eslint-disable */
/*istanbul ignore next*/
/* global expect */

const request = require('request-promise')
const xml2js = require('xml2js-es6-promise')
const malintent = require('./malintent.js')
require('./extensions.js')

const username = 'unistudent'
const password = '+)}/wnP.G46D63TkUKq4'
const fakePassword = 'notARealPassword'

// malintent.verifyUserPromise(username, fakePassword)
// 	.then( data => {
// 		data.print()
// 	}).catch(err => {
// 		err.print()
// 	})

function testPromise() {
	return new Promise(function(resolve, reject) {
		request.get({
			url: 'https://myanimelist.net/api/anime/search.xml?q=fate',
			headers: {
				'Authorization': 'Basic cmFkdGhlcjo0Mi5ZV3JBby5hMj1lVg=='
			},
			simple: false,
			resolveWithFullResponse: true
		})
		.then((body)  => {
			resolve(body)
		}).catch( err => {
			reject(err)
		})
	})
}

testPromise().then( data => {
	data.print()
}).catch( err => {
	err.print()
})


