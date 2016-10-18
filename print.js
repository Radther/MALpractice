'use strict'

exports.print = function(message) {
	console.log(message)
}

exports.printAll = function(messages) {
	for (var i = messages.length - 1; i >= 0; i--) {
		let message = messages[i]
		console.log(message)
	}
}