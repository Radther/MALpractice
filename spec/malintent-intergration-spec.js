'use strict'
/*istanbul ignore next*/
/* global expect */

const MALintent = require('../MALintent.js')
const MALsponse = MALintent.malsponse

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

xdescribe('MALintent Intergration Tests', function() {

	describe('verification tests', function() {
		it('verifiy user success', (done) => {
			MALintent.verifyUser(username, password)
				.then(data => {
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

	// describe('search anime tests', function() {
	// 	it('single word search', (done) => {
	// 		MALintent.searchAnime(username, password, 'fate', function(result) {
	// 			expect(result).not.toBe(Malsponse.invalidSearch)
	// 			expect(result).not.toBe(Malsponse.failedToParse)
	// 			expect(result).not.toBe(Malsponse.invalidSearch)
	// 			done()
	// 		})
	// 	})

	// 	it('multi word search', (done) => {
	// 		MALintent.searchAnime(username, password, 'fate night', function(result) {
	// 			expect(result).not.toBe(Malsponse.invalidSearch)
	// 			expect(result).not.toBe(Malsponse.failedToParse)
	// 			expect(result).not.toBe(Malsponse.invalidSearch)
	// 			done()
	// 		})
	// 	})
	// })

	// describe('single anime test', function() {
	// 	it('get single anime', (done) => {
	// 		const animeId = 1
	// 		MALintent.getAnime(animeId, function(result) {
	// 			expect(result).not.toBeNull()
	// 			expect(result).not.toBe(Malsponse.animeNotFound)

	// 			expect(result.title).toBe('Cowboy Bebop')
	// 			done()
	// 		})
	// 	})
	// })

	// describe('get users list test', function() {
	// 	it('get users list', (done) => {
	// 		MALintent.getAnimeList(username, function(result) {
	// 			expect(result).not.toBeNull()
	// 			expect(result.count).not.toBeLessThan(1)
	// 			done()
	// 		})
	// 	})
	// })

	// describe('xml creation test', function() {
		
	// })

})
