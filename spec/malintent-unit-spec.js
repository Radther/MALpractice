'use strict'
/*istanbul ignore next*/
/* global expect */

const rewire = require('rewire')
const MALintent = rewire('../MALintent.js')
const MALsponse = MALintent.malsponse
const fs = require('fs')
const StatusCodes = require('../StatusCodes.js').StatusCodes

const username = 'unistudent'
const password = '+)}/wnP.G46D63TkUKq4'
const fakePassword = 'notARealPassword'
const userid = '5778142'

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

	describe('search anime tests', function() {

		MALintent.__set__('runSearchRequest', function(username, password, search) {
			return new Promise(function(resolve, reject) {
				if (search === 'no content') {
					reject(StatusCodes.noContent)
				} else if (search === 'new game') {
					const xmlData = fs.readFileSync('./spec/fakedata/search/multi.xml', 'utf8')
					resolve(xmlData)
				} else {
					const xmlData = fs.readFileSync('./spec/fakedata/search/single.xml', 'utf8')
					resolve(xmlData)
				}
			})
		})

		it('single word search', (done) => {
			MALintent.searchAnime(username, password, 'fate')
				.then( anime => {
					expect(anime).not.toBeNull()
					done()
				}).catch( err => {
					fail(err)
				})
		})

		it('multi word search', (done) => {
			MALintent.searchAnime(username, password, 'new game')
				.then( anime => {
					expect(anime).not.toBeNull()
					done()
				}).catch( err => {
					fail(err)
				})
		})

		it('no content search', (done) => {
			MALintent.searchAnime(username, password, 'no content')
				.then( () => {
					fail('should be no content')
				}).catch( err => {
					expect(err).toBe(StatusCodes.noContent)
					done()
				})
		})
	})
})
