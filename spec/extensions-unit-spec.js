'use strict'
/*istanbul ignore next*/
/* global expect */

require('../modules/extensions.js')

describe('extension tests', () => {
	it('get first in array test', (done) => {
		const array = ['test', 'test2','test3']

		expect(array.first()).toBe('test')
		done()
	})

	it('inject url param', (done) => {
		const url = 'thing/com?param={item}'
		const newUrl = url.injectURLParam('item', 'test')

		expect(newUrl).toBe('thing/com?param=test')
		done()
	})

	it('inject XML param', (done) => {
		const xml = '<test>{param}</test>'
		const newXml = xml.injectXMLParam('param', 'test')

		expect(newXml).toBe('<test>test</test>')
		done()
	})
})
