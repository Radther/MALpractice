'use strict'

/**
 * Creates a success response with data
 * @param  {String} message the message included in the response
 * @param  {Any} data    the data of the response
 * @return {JSON}         the JSON response
 */
exports.createResponse = function(message, data) {
	return {
		status: 'Success',
		message: message,
		data: data
	}
}

/**
 * Creates an error response
 * @param  {String} message the error message
 * @return {JSON}         the JSON response
 */
exports.createError = function(message) {
	return {
		status: 'Error',
		message: message
	}
}
