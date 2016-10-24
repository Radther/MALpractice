'use strict'

exports.createResponse = function(message, data) {
	return {
		status: 'Success',
		message: message,
		data: data
	}
}

exports.createError = function(message) {
	return {
		status: 'Error',
		message: message
	}
}
