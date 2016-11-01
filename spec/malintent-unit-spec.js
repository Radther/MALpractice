'use strict'
/*istanbul ignore next*/
/* global expect */

const rewire = require('rewire')
const MALintent = rewire('../MALintent.js')
const MALsponse = MALintent.malsponse
const fs = require('fs')

const username = 'unistudent'
const password = '+)}/wnP.G46D63TkUKq4'
const fakePassword = 'notARealPassword'
const userid = '5778142'

// StatusCodes
const StatusCodes = {
	ok: 200,
	created: 201,
	accepted: 202,
	badRequest: 400,
	unauthorised: 401,
	notFound: 404
}

describe('MALintent Unit Tests', function() {
	describe('verification tests', function() {

		MALintent.__set__('runAuthRequest', function(username, password) {
			return new Promise(function(resolve, reject) {
				if (password === fakePassword) {
					reject(StatusCodes.unauthorised)
				} else {
					const xmlData = fs.readFileSync('./spec/fakedata/authentication/valid.xml', 'utf8')
					resolve(xmlData)
				}
			})
		})

		it('verifiy user success', (done) => {
			MALintent.verifyUser(username, password)
				.then(data => {
					data.print()
					expect(data.response).toBe(MALsponse.verified)
					expect(data.userid).toBe(userid)
					expect(data.username).toBe(username)
					done()
				}).catch( err => {
					fail(err)
				})
		})

		it('verify user fail', (done) => {
			MALintent.verifyUser(username, fakePassword)
				.then( () => {
					fail('This should not be called')
				}).catch( err => {
					expect(err).toBe(StatusCodes.unauthorised)
					done()
				})
		})
	})
})
