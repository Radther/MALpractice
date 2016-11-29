'use strict'

Object.prototype.hateifyLink = function(name, link) {
	if (this._links === undefined) {
		this._links = {}
	}

	this._links[name] = link
}
