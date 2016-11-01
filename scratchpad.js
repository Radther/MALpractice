'use strict'
/* eslint-disable */
/*istanbul ignore next*/
/* global expect */

// const request = require('request-promise')
// const xml2js = require('xml2js-es6-promise')
const malintent = require('./malintent.js')
require('./extensions.js')

const username = 'unistudent'
const password = '+)}/wnP.G46D63TkUKq4'
const fakePassword = 'notARealPassword'

malintent.verifyUserPromise(username, fakePassword)
	.then( data => {
		data.print()
	}).catch(err => {
		err.print()
	})

// function testPromise() {
// 	return new Promise(function(resolve, reject) {
// 		request.get('https://myanimelist.net/malappinfo.php?u=radther&status=all&type=anime')
// 		.then((body, res)  => {
// 			resolve(body)
// 		}).catch( err => {
// 			reject(err)
// 		})
// 	})
// }

// testPromise().then( data => {
// 	xml2js(data)
// }).then( json => {
// 	json.print()
// }).catch( err => {
// 	err.print()
// })