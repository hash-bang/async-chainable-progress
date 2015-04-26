var async = require('async-chainable');
var asyncProgress = require('./');

async()
	.use(asyncProgress)
	.progress(0)
	.then(function(next) {
		console.log('Start in 1 seconds...');
		setTimeout(next, 1000);
	})
	.progress(50)
	.then(function(next) {
		console.log('Finish in 2 seconds...');
		setTimeout(next, 2000);
	})
	.progress(100)
	.end();
