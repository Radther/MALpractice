'use strict'
/* eslint-disable */
/*istanbul ignore next*/
/* global expect */

/**
 * scratch pad
 * noun	chiefly N. Amer.
 * a notepad.
 */

const request = require('request-promise')
const xml2js = require('xml2js-es6-promise')
const malintent = require('./modules/malintent.js')
const storage = require('node-persist')
require('./modules/extensions.js')

const username = 'unistudent'
const password = '+)}/wnP.G46D63TkUKq4'
const fakePassword = 'notARealPassword'

malintent.deleteAnime(username, password, 1)
	.then( result => {
		result
	}).catch( err => {
		err
	})