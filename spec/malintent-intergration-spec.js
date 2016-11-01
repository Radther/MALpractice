'use strict'
/*istanbul ignore next*/
/* global expect */

const MALintent = require('../MALintent.js')
const MALsponse = MALintent.malsponse
const StatusCodes = require('../StatusCodes.js').StatusCodes

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

	// describe('single anime test', function() {
	// 	it('get single anime', done => {
	// 		const animeId = 1
	// 		MALintent.getAnime(animeId, function(result) {
	// 			expect(result).not.toBeNull()
	// 			expect(result).not.toBe(Malsponse.animeNotFound)

	// 			expect(result.title).toBe('Cowboy Bebop')
	// 			done()
	// 		})
	// 	})
	// })

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
})
