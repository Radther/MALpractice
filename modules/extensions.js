'use strict'

/**
 * Returns the first item in an array
 * @return {Any} the first item in an array
 */
Array.prototype.first = function() {
	return this[0]
}

/**
 * Returns a url string with the parameter replaced with a value
 * @param  {String} paramName the parameter name to be changed
 * @param  {Any} item      the new data
 * @return {String}           a string with the injected value
 */
String.prototype.injectURLParam = function(paramName, item) {
	const replaceString = `{${paramName}}`

	return this.replace(replaceString, item)
}

/**
 * Returns XML data with the paraneter injected
 * @param  {String} paramName the parameter name
 * @param  {Any} item      the new data
 * @return {String}           XML string with the injected value
 */
String.prototype.injectXMLParam = function(paramName, item) {
	const replaceString = `{${paramName}}`
	const value = item || ''

	return this.replace(replaceString, value)
}
