'use strict'
/*istanbul ignore next*/
/* global expect */

const MALintent = require('../MALintent.js')
const Malsponse = MALintent.malsponse

const username = 'unistudent'
const password = '+)}/wnP.G46D63TkUKq4'
const fakePassword = 'notARealPassword'

describe('MALintent Tests', function() {

	describe('verification tests', function() {
		it('verifiy user success', (done) => {
			MALintent.verifyUser(username, password, function(malsponse, userid) {
				expect(malsponse).not.toBeNull()
				expect(malsponse).toBe(Malsponse.verified)

				expect(userid).not.toBeNull()
				done()
			})
		})

		it('verify user fail', (done) => {
			MALintent.verifyUser(username, fakePassword, function(malsponse) {
				expect(malsponse).not.toBeNull()
				expect(malsponse).toBe(Malsponse.unauthorised)

				done()
			})
		})
	})

	describe('search anime tests', function() {
		it('single word search', (done) => {
			MALintent.searchAnime(username, password, 'fate', function(result) {
				expect(result).not.toBe(Malsponse.invalidSearch)
				expect(result).not.toBe(Malsponse.failedToParse)
				expect(result).not.toBe(Malsponse.invalidSearch)
				done()
			})
		})

		it('multi word search', (done) => {
			MALintent.searchAnime(username, password, 'fate night', function(result) {
				expect(result).not.toBe(Malsponse.invalidSearch)
				expect(result).not.toBe(Malsponse.failedToParse)
				expect(result).not.toBe(Malsponse.invalidSearch)
				done()
			})
		})
	})

	describe('single anime test', function() {
		it('get single anime', (done) => {
			const animeId = 1
			MALintent.getAnime(animeId, function(result) {
				expect(result).not.toBeNull()
				expect(result).not.toBe(Malsponse.animeNotFound)

				expect(result.title).toBe('Cowboy Bebop')
				done()
			})
		})
	})

})
