'use strict'
/* eslint-disable */
/*istanbul ignore next*/
/* global expect */

const request = require('request-promise')
const xml2js = require('xml2js-es6-promise')
const malintent = require('./modules/malintent.js')
const storage = require('node-persist')
require('./modules/extensions.js')

const username = 'unistudent'
const password = '+)}/wnP.G46D63TkUKq4'
const fakePassword = 'notARealPassword'

storage.initSync({
	dir: 'data/anime',
	stringify: JSON.stringify,
	parse: JSON.parse,
	encoding: 'utf8'
})

storage.getItemSync('1').print()

// storage.setItem('1', {
// 	title: 'Cowboy',
// 	episodes: '12'
// })