var _ = require('lodash');
var argy = require('argy');
var clui = require('clui');
var terminal = require('terminal-kit').terminal;

module.exports = function() {
	this._progressObjects = {};

	// Main renderer {{{
	this._plugins['progress'] = function(params) {
		var self = this;
		// Set Default options {{
		_.defaults(params, this._progressDefaults);
		// }}}
		// Check that the ID'd object exists {{{
		var item = params.item;

		if (!item.id || !item.type) throw new Error("No ID or type for progress item");
		if (!this._progressObjects[item.id]) {
			this._progressObjects[item.id] = {};
			switch (item.type) {
				case 'progressBar':
					this._progressObjects[item.id] = _.defaults({
						rendered: 0,
						type: 'progressBar',
						objRef: new clui.Progress(params.width || params.progress.width),
						max: params.progress.max,
						value: params.progress.value,
						text: params.text || params.progress.text,
					}, item);
					break;
				case 'spinner':
					this._progressObjects[item.id] = _.defaults({
						rendered: 0,
						type: 'spinner',
						spinners: params.spinners || params.spinner.spinners,
						text: params.text || params.spinner.text,
					}, item);
					break;
				default: throw new Error('Unknown async-chainable-progress type: ' + item.type);
			}
		}
		// }}}
		// Accept updated parameters {{{
		['value', 'max', 'text'].forEach(function(option) {
			if (item[option]) self._progressObjects[item.id][option] = item[option];
		});
		// }}}
		this._progressRender();

		this._execute();
	};

	this._progressRender = function() {
		for (var id in this._progressObjects) {
			var obj = this._progressObjects[id];
			switch (obj.type) {
				case 'progressBar':
					if (obj.rendered++ > 0) terminal.up(1).eraseLineAfter();
					process.stdout.write(
						(obj.text ? obj.text + ' ' : '') +
						obj.objRef.update(obj.value, obj.max) +
						"\n"
					);
					break;
				case 'spinner':
					if (obj.rendered++ > 0) terminal.up(1).eraseLineAfter();
					obj.rendered++;
					process.stdout.write('\u001b[96m' + obj.spinners[obj.rendered % obj.spinners.length] + '\u001b[90m ' + obj.text + "\u001b[0m\n");
					break;
			}
		}
	};
	// }}}

	// .progress() {{{
	this.progress = function() {
		var chain = this;

		argy(arguments)
			.ifForm('', function() {
				chain._struct.push({
					type: 'progress',
					item: {
						id: 'anonBar',
						type: 'progressBar',
						value: 0,
					},
				});
			})
			.ifForm('string', function(key) {
				chain._struct.push({
					type: 'progress',
					item: {
						type: 'progressBar',
						id: key,
					},
				});
			})
			.ifForm('string string', function(key, text) {
				chain._struct.push({
					type: 'progress',
					item: {
						type: 'progressBar',
						id: key,
						text: text,
					},
				});
			})
			.ifForm('null string', function(junk, text) {
				chain._struct.push({
					type: 'progress',
					item: {
						type: 'progressBar',
						id: 'anonBar',
						text: text,
					},
				});
			})
			.ifForm('string object', function(key, settings) {
				settings.id = key;
				settings.type = 'progressBar';
				chain._struct.push({type: 'progress', item: sertings});
			})
			.ifForm('string number', function(key, progress) {
				this._struct.push({
					type: 'progress',
					item: {
						type: 'progressBar',
						id: key,
						value: progress,
					},
				});
			})
			.ifForm('string number number', function(key, progress, max) {
				chain._struct.push({
					type: 'progress',
					item: {
						type: 'progressBar',
						id: key,
						value: progress,
						max: max,
					},
				});
			})
			.ifForm('number', function(progress) {
				chain._struct.push({
					type: 'progress',
					item: {
						type: 'progressBar',
						id: 'anonBar',
						value: progress,
					},
				});
			})
			.ifFormElse(function(form) {
				throw new Error('Unsupported call type for async-chainable-progress/progress: ' + form);
			});

		return this;
	};
	// }}}

	// .spinner() {{{
	this.spinner = function() {
		var chain = this;

		argy(arguments)
			.ifForm('', function() {
				chain._struct.push({
					type: 'progress',
					item: {
						id: 'anonSpinner',
						type: 'spinner',
					},
				});
			})
			.ifForm('string', function(key) {
				chain._struct.push({
					type: 'progress',
					item: {
						id: key,
						type: 'spinner',
					},
				});
			})
			.ifForm('null string', function(junk, text) {
				chain._struct.push({
					type: 'progress',
					item: {
						type: 'spinner',
						id: 'anonSpinner',
						text: text,
					},
				});
			})
			.ifForm('string string', function(key, text) {
				chain._struct.push({
					type: 'progress',
					item: {
						type: 'spinner',
						id: key,
						text: text,
					},
				});
			})
			.ifFormElse(function(form) {
				throw new Error('Unsupported call type for async-chainable-progress/spinner: ' + form);
			});

		return this;
	};
	// }}}

	// .tick() {{{
	this.tick = argy('string [string]', function(text, status) {
		this._struct.push({type: 'progressTick', text: text, status: status || 'ok'});

		this._progressRender();

		return this;
	});

	this._plugins['progressTick'] = function(params) {
		console.log(this._progressDefaults.tick[params.status], params.text);

		this._progressRender();
		this._execute();
	};
	// }}}

	// .progressDefaults() {{{
	this._progressDefaults = {
		buffer: {
			x: 0,
			y: 0,
			width: 'console',
			height: 'console',
		},
		progress: {
			width: 50,
			value: 0,
			max: 100,
			text: null,
		},
		spinner: {
			text: 'Working...',
			spinners: process.platform == 'win32' ? ['|','/','-','\\'] : ['◜','◠','◝','◞','◡','◟'],
		},
		tick: {
			ok: '\u001b[32m' + '✓' + '\u001b[0m',
			fail: '\u001b[31m' + '✖' + '\u001b[0m',
			pending: '\u001b[36m' + '-' + '\u001b[0m',
		},
	};

	this._plugins['progressDefaults'] = function(params) {
		this._progressDefaults = params.payload;
		this._execute(); // Move onto next chain item
	};

	this.progressDefaults = function() {
		var chain = this;

		argy(arguments)
			.ifForm('', function() {})
			.ifForm('object', function(settings) {
				chain._struct.push({
					type: 'progressDefaults',
					payload:  arguments[0],
				});
			})
			.ifFormElse(function(form) {
				throw new Error('Unsupported call type for async-chainable-progress/progressDefaults: ' + form);
			});

		return this;
	};
	// }}}

	// .progressComplete() {{{
	this.progressComplete = function() {
		var chain = this;

		argy(arguments)
			.ifForm('', function() {
				chain._struct.push({type: 'progressComplete'});
			})
			.ifForm('string', function(key) {
				chain._struct.push({type: 'progressComplete', ids: [key]});
			})
			.ifForm('array', function(keys) {
				chain._struct.push({type: 'progressComplete', ids: keys});
			})
			.ifFormElse(function(form) {
				throw new Error('Unsupported call type for async-chainable-progress/progressComplete: ' + form);
			});

		return this;
	};

	this._plugins['progressComplete'] = function(params) {
		var removeIds = params.ids || false;

		for (var id in this._progressObjects) {
			if (!removeIds || !(removeIds.indexOf(id) > -1)) {
				if (this._progressObjects[id].rendered++ > 0) terminal.up(1).eraseLineAfter(); // Remove from terminal also
				delete this._progressObjects[id];
			}
		}

		this._progressRender();
		this._execute();
	};
	// }}}

	// .setProgress() {{{
	this.setProgress = function() {
		var chain = this;
		var progressObj;

		argy(arguments)
			.ifForm('', function() {
				if (! (progressObj = _.find(chain._progressObjects, {id: 'anonBar'})) ) return;
				progressObj.value = 0;
			})
			.ifForm('number', function(progress) {
				if (! (progressObj = _.find(chain._progressObjects, {id: 'anonBar'})) ) return;
				progressObj.value = progress;
			})
			.ifForm('number number', function(progress, max) {
				if (! (progressObj = _.find(chain._progressObjects, {id: 'anonBar'})) ) return;
				progressObj.value = progress;
				progressObj.max = max;
			})
			.ifFormElse(function(form) {
				throw new Error('Unsupported call type for async-chainable-progress/setProgress: ' + form);
			});

		this._progressRender();

		return this;
	};
	// }}}

	// Make shortcut for setProgress / progressComplete inside context object
	this._context.setProgress = this.setProgress.bind(this);
};
