'use strict'
/*istanbul ignore next*/
/* global expect */

const MALintent = require('../modules/MALintent.js')
const MALsponse = MALintent.malsponse
const StatusCodes = require('../modules/StatusCodes.js').StatusCodes
const requestp = require('request-promise')

const uniUsername = 'unistudent'
const uniPassword = '+)}/wnP.G46D63TkUKq4'
const fakePassword = 'notARealPassword'
const userid = '5778142'

describe('MALintent Intergration Tests', () => {

	describe('verification tests', function() {
		it('verifiy user success', done => {
			MALintent.verifyUser(uniUsername, uniPassword)
				.then(data => {
					expect(data.response).toBe(MALsponse.verified)
					expect(data.userid).toBe(userid)
					expect(data.username).toBe(uniUsername)
					done()
				}).catch( err => {
					throw new Error(err)
				})
		})

		it('verify user fail', done => {
			MALintent.verifyUser(uniUsername, fakePassword)
				.then( () => {
					throw new Error('This should not be called')
				}).catch( err => {
					expect(err).toBe(StatusCodes.unauthorised)
					done()
				})
		})
	})

	describe('search anime tests', () => {
		it('single word search', done => {
			MALintent.searchAnime(uniUsername, uniPassword, 'fate')
				.then( anime => {
					expect(anime).not.toBeNull()
					done()
				}).catch( err => {
					throw new Error(err)
				})
		})

		it('multi word search', done => {
			MALintent.searchAnime(uniUsername, uniPassword, 'new game')
				.then( anime => {
					expect(anime).not.toBeNull()
					done()
				}).catch( err => {
					throw new Error(err)
				})
		})

		it('no content search', done => {
			MALintent.searchAnime(uniUsername, uniPassword, 'no content')
				.then( () => {
					throw new Error('should be no content')
				}).catch( err => {
					expect(err).toBe(StatusCodes.noContent)
					done()
				})
		})
	})

	describe('get users list test', () => {
		it('get users list', done => {
			MALintent.getAnimeList(uniUsername)
				.then( data => {
					expect(data.length).not.toBeLessThan(1)
					done()
				}).catch( err => {
					throw new Error(err)
				})
		})
	})

	describe('add anime to list', () => {

		beforeEach( done => {
			const options = {
				method: 'DELETE',
				url: 'https://myanimelist.net/api/animelist/delete/1.xml',
				headers: {
					'Authorization': 'Basic dW5pc3R1ZGVudDorKX0vd25QLkc0NkQ2M1RrVUtxNA=='
				}
			}

			requestp(options)
				.then( () => {
					done()
				}).catch(err => {
					err.print()
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
	})

	describe('update anime', () => {

		it('update anime', done => {
			const animeData = {
				malid: '1',
				status: '2',
				episode: '4'
			}

			MALintent.updateAnime(uniUsername, uniPassword, animeData)
				.then( data => {
					expect(data).toBe(MALsponse.updatedSuccessfully)
					done()
				}).catch( err => {
					err.print()
				})
		})
	})

	describe('single anime test', function() {
		it('get single anime', done => {
			const animeId = 1

			MALintent.getAnime(animeId)
				.then( anime => {
					expect(anime).not.toBeNull()
					expect(anime).not.toBe(MALsponse.animeNotFound)

					expect(anime.title).toBe('Cowboy Bebop')
					done()
				}).catch( err => {
					err.print()
				})
		})

		it('get single anime 404', done => {
			const animeId = 2

			MALintent.getAnime(animeId)
				.then( () => {
					throw new Error('shouldn\'t be called')
				}).catch( err => {
					expect(err).toBe(MALsponse.animeNotFound)
					done()
				})
		})
	})
})
