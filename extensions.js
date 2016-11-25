'use strict'

Object.prototype.print = function() {
	console.log(this)
}

Array.prototype.print = function() {
	for (let i = this.length - 1; i >= 0; i--) {
		const item = this[i]

		item.print()
	}
}

Array.prototype.first = function() {
	return this[0]
}

String.prototype.injectURLParam = function(paramName, item) {
	const replaceString = `{${paramName}}`

	return this.replace(replaceString, item)
}

String.prototype.injectXMLParam = function(paramName, item) {
	const replaceString = `{${paramName}}`
	const value = item || ''

	return this.replace(replaceString, value)
}
