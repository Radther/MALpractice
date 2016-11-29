'use strict'
/*istanbul ignore next*/
/* global expect */

require('../modules/hateify.js')

describe('hateify tests', () => {
	describe('link tests', () => {
		it('add link', (done) => {
			const json = {
				name: 'Tom'
			}

			json.hateifyLink('self', 'example.com/people/1')

			expect(json).toBe({
				name: 'Tom',
				_links: {
					self: 'example.com/people/1'
				}
			})

			done()
		})
	})
})
