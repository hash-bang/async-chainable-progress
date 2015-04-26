async-chainable-progress
========================
Plugin for [async-chainable](https://github.com/hash-bang/async-chainable) that adds progress reporting.


	var asyncChainable = require('async-chainable');
	var asyncChainableProgress = require('async-chainable-progress');

	asyncChainable()
		.use(asyncChainableProgress)
		.progress()
		.then(function(next) { setTimeout(next, 1000) })
		.progress(50)
		.then(function(next) { setTimeout(next, 1000) })
		.progress(100)
		.then(function(next) { setTimeout(next, 1000) })
		.end();
