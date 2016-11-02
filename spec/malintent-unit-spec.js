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
					const data = {
						statusCode: StatusCodes.unauthorised,
						body: ''
					}
					resolve(data)
				} else {
					const xmlData = fs.readFileSync('./spec/fakedata/authentication/valid.xml', 'utf8')
					const data = {
						statusCode: StatusCodes.ok,
						body: xmlData
					}
					resolve(data)
				}
			})
		})

		xit('verifiy user success', (done) => {
			MALintent.verifyUser(uniUsername, uniPassword)
				.then(data => {
					expect(data.response).toBe(MALsponse.verified)
					expect(data.userid).toBe(userid)
					expect(data.username).toBe(uniUsername)
					done()
				}).catch( err => {
					err.print()
				})
		})

		it('verify user fail', (done) => {
			MALintent.verifyUser(uniUsername, fakePassword)
				.then( () => {
					'This should not be called'.print()
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
					const data = {
						statusCode: StatusCodes.ok,
						body: xmlData
					}
					resolve(data)
				} else {
					const xmlData = fs.readFileSync('./spec/fakedata/search/single.xml', 'utf8')
					const data = {
						statusCode: StatusCodes.ok,
						body: xmlData
					}
					resolve(data)
				}
			})
		})

		it('single word search', (done) => {
			MALintent.searchAnime(uniUsername, uniPassword, 'fate')
				.then( anime => {
					expect(anime).not.toBeNull()
					done()
				}).catch( err => {
					err.print()
				})
		})

		it('multi word search', (done) => {
			MALintent.searchAnime(uniUsername, uniPassword, 'new game')
				.then( anime => {
					expect(anime).not.toBeNull()
					done()
				}).catch( err => {
					err.print()
				})
		})

		it('no content search', (done) => {
			MALintent.searchAnime(uniUsername, uniPassword, 'no content')
				.then( () => {
					'should be no content'.print()
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
					const data = {
						statusCode: StatusCodes.ok,
						body: xmlData
					}
					resolve(data)
				} else if (username === uniUsername) {
					const xmlData = fs.readFileSync('./spec/fakedata/mylist/fulllist.xml')
					const data = {
						statusCode: StatusCodes.ok,
						body: xmlData
					}
					resolve(data)
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

	describe('add anime to list', () => {

		MALintent.__set__('runAddAnimeRequest', function(username, password, animeData) {
			return new Promise(function(resolve, reject) {
				if (animeData.malid === '1') {
					resolve({
						statusCode: StatusCodes.created,
						body: 'Created'
					})
				} else if (animeData.malid === '2') {
					resolve({
						statusCode: StatusCodes.badRequest,
						body: 'This anime has not been approved yet.'
					})
				} else {
					resolve({
						statusCode: StatusCodes.badRequest,
						body: 'The anime (id: <number>) is already in the list.'
					})
				}
			})
		})

		it('add new anime', done => {
			const animeData = {
				malid: '1',
				status: '2',
				episode: '4'
			}

			MALintent.addAnime(uniUsername, uniPassword, animeData)
				.then( data => {
					expect(data).toBe(MALsponse.addedSuccessfully)
					done()
				}).catch( err => {
					err.print()
				})
		})

		it('add existing anime', done => {
			const animeData = {
				malid: '3',
				status: '2',
				episode: '4'
			}

			MALintent.addAnime(uniUsername, uniPassword, animeData)
				.then( data => {
					data.print()
					throw new Error('this should have errored')
				}).catch( err => {
					expect(err).toBe(MALsponse.alreadyAdded)
					done()
				})
		})

		it('add unavailable anime', done => {
			const animeData = {
				malid: '2',
				status: '2',
				episode: '4'
			}

			MALintent.addAnime(uniUsername, uniPassword, animeData)
				.then( data => {
					data.print()
					throw new Error('this should have errored')
				}).catch( err => {
					expect(err).toBe(MALsponse.failedToAdd)
					done()
				})
		})
	})
})
