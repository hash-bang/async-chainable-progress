var async = require('async-chainable');
var asyncProgress = require('../');

async()
	.use(asyncProgress)
	.progress(null, 'Doing things')
	.then(function(next) {
		setTimeout(next, 1000);
	})
	.progress(50)
	.then(function(next) {
		setTimeout(next, 2000);
	})
	.progressComplete()
	.tick('Finished')
	.end();
