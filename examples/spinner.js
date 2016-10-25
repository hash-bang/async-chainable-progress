var async = require('async-chainable');
var asyncProgress = require('../');

async()
	.use(asyncProgress)
	.spinner('Thinking...')
	.then(function(next) { setTimeout(next, 100) })
	.spinner()
	.then(function(next) { setTimeout(next, 100) })
	.spinner()
	.then(function(next) { setTimeout(next, 100) })
	.spinner()
	.then(function(next) { setTimeout(next, 100) })
	.spinner('Ruminating...')
	.then(function(next) { setTimeout(next, 100) })
	.spinner()
	.then(function(next) { setTimeout(next, 100) })
	.spinner()
	.then(function(next) { setTimeout(next, 100) })
	.spinner('Cogitating...')
	.then(function(next) { setTimeout(next, 100) })
	.spinner()
	.then(function(next) { setTimeout(next, 100) })
	.spinner()
	.then(function(next) { setTimeout(next, 100) })
	.progressComplete()
	.end();