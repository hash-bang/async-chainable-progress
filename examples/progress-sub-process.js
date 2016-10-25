var async = require('async-chainable');
var asyncProgress = require('../');

async()
	.use(asyncProgress)
	.progress(0)
	.then(function(next) {
		var self = this;
		var percent = 0;
		var update = function() {
			percent += 5;
			if (percent > 100) return next;
			self.setProgress(percent);
			setTimeout(update, 100);
		};
		update();
	})
	.progressComplete()
	.end();
