'use strict'

/**
 * Creates a success response with data
 * @param  {String} message the message included in the response
 * @param  {Any} data    the data of the response
 * @param  {request} req the request of the response
 * @return {JSON}         the JSON response
 */
exports.createResponse = function(message, data, req) {
	const response = {
		status: 'Success',
		message: message,
		_embedded: data
	}

	if (req !== undefined) {
		response.hateifyLink('self', req._url.href)
	}
	return response
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
