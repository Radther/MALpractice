'use strict'
/* eslint-disable */
/*istanbul ignore next*/
/* global expect */

const MALintent = require('./MALintent.js')

const username = 'unistudent'
const password = '+)}/wnP.G46D63TkUKq4'

describe("test", function() {

	xit('verifiy the user', (done) => {
		MALintent.verifyUser(username, password, function(result) {
			expect(result).not.toBeNull()
			done()
		})
	})
})