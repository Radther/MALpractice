'use strict'

/**
 * Adds hateos links to JSON
 * @param  {String} name the name of the link (for example 'self')
 * @param  {String} link the url to add
 * @return {N/A}      N/A
 */
Object.prototype.hateifyLink = function(name, link) {
	if (this._links === undefined) {
		this._links = {}
	}

	this._links[name] = link
}
