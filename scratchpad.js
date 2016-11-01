'use strict'
/* eslint-disable */
/*istanbul ignore next*/
/* global expect */

const request = require('request-promise')
const xml2js = require('xml2js-es6-promise')
require('./extensions.js')

function testPromise() {
	return new Promise(function(resolve, reject) {
		request.get('http://google.com')
		.then((body, res)  => {
			resolve(body)
		}).catch( err => {
			reject(err)
		})
	})
}

testPromise().then( data => {
	return xml2js(data)
}).then( json => {
	json.print()
}).catch( err => {
	err.print()
})