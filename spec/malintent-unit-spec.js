'use strict'
/*istanbul ignore next*/
/* global expect */

const rewire = require('rewire')
const MALintent = rewire('../MALintent.js')
const MALsponse = MALintent.malsponse
const fs = require('fs')
const StatusCodes = require('../StatusCodes.js').StatusCodes

const uniUsername = 'unistudent'
const uniPassword = '+)}/wnP.G46D63TkUKq4'
const fakePassword = 'notARealPassword'
const userid = '5778142'

describe('MALintent Unit Tests', () => {
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
			MALintent.verifyUser(uniUsername, uniPassword)
				.then(data => {
					expect(data.response).toBe(MALsponse.verified)
					expect(data.userid).toBe(userid)
					expect(data.username).toBe(uniUsername)
					done()
				}).catch( err => {
					fail(err)
				})
		})

		it('verify user fail', (done) => {
			MALintent.verifyUser(uniUsername, fakePassword)
				.then( () => {
					fail('This should not be called')
				}).catch( err => {
					expect(err).toBe(StatusCodes.unauthorised)
					done()
				})
		})
	})

	describe('search anime tests', () => {

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
			MALintent.searchAnime(uniUsername, uniPassword, 'fate')
				.then( anime => {
					expect(anime).not.toBeNull()
					done()
				}).catch( err => {
					fail(err)
				})
		})

		it('multi word search', (done) => {
			MALintent.searchAnime(uniUsername, uniPassword, 'new game')
				.then( anime => {
					expect(anime).not.toBeNull()
					done()
				}).catch( err => {
					fail(err)
				})
		})

		it('no content search', (done) => {
			MALintent.searchAnime(uniUsername, uniPassword, 'no content')
				.then( () => {
					fail('should be no content')
				}).catch( err => {
					expect(err).toBe(StatusCodes.noContent)
					done()
				})
		})
	})

	describe('anime list test', () => {
		MALintent.__set__('runGetUserAnimeRequest', function(username) {
			return new Promise(function(resolve, reject) {
				if (username === uniUsername+'empty') {
					const xmlData = fs.readFileSync('./spec/fakedata/mylist/emptylist.xml')
					resolve(xmlData)
				} else if (username === uniUsername) {
					const xmlData = fs.readFileSync('./spec/fakedata/mylist/fulllist.xml')
					resolve(xmlData)
				} else {
					reject(StatusCodes.noContent)
				}
			})
		})

		it('full user data', done => {
			MALintent.getAnimeList(uniUsername)
				.then( data => {
					expect(data.length).not.toBeLessThan(1)
					done()
				}).catch( err => {
					throw new Error(err)
				})
		})

		it('empty user data', done => {
			MALintent.getAnimeList(uniUsername+'empty')
				.then( data => {
					throw new Error('should fail with code 204')
				}).catch( err => {
					expect(err).toBe(StatusCodes.noContent)
					done()
				})
		})
	})
})
