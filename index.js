var _ = require('lodash');
var clui = require('clui');
var terminal = require('terminal-kit').terminal();

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
					process.stdout.write(obj.objRef.update(obj.value, obj.max));
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

	// .progress {{{
	this.progress = function() {
		var calledAs = this._getOverload(arguments);
		switch(calledAs) {
			case '':
				this._struct.push({
					type: 'progress',
					item: {
						id: 'anonBar',
						type: 'progressBar',
						value: 0,
					},
				});
				break;
			case 'string,array': // Form: progress(name, params)
				var args = arguments[1];
				args.id = arguments[0];
				args.type = 'progressBar';
				this._struct.push({type: 'progress', item: args});
				break;
			case 'number': // Form: progress(progress_complete)
				this._struct.push({
					type: 'progress',
					item: {
						type: 'progressBar',
						id: 'anonBar',
						value: arguments[0],
					},
				});
				break;
			default:
				throw new Error('Unsupported call type for async-chainable-progress/progress: ' + calledAs);
		}

		return this;
	};
	// }}}

	// .spinner() {{{
	this.spinner = function() {
		var calledAs = this._getOverload(arguments);
		switch(calledAs) {
			case '':
				this._struct.push({
					type: 'progress',
					item: {
						id: 'anonSpinner',
						type: 'spinner',
					},
				});
				break;
			case 'string,array': // Form: spinner(name, params)
				var args = arguments[1];
				args.id = arguments[0];
				args.type = 'spinner';
				this._struct.push({type: 'progress', item: args});
				break;
			case 'string': // Form: spinner(text)
				this._struct.push({
					type: 'progress',
					item: {
						type: 'spinner',
						id: 'anonSpinner',
						text: arguments[0],
					},
				});
				break;
			default:
				throw new Error('Unsupported call type for async-chainable-progress/spinner: ' + calledAs);
		}

		return this;
	};
	// }}}

	// .progressDefaults {{{
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
		},
		spinner: {
			text: 'Working...',
			spinners: process.platform == 'win32' ? ['|','/','-','\\'] : ['◜','◠','◝','◞','◡','◟'],
		},
	};

	this._plugins['progressDefaults'] = function(params) {
		this._progressDefaults = params.payload;
		this._execute(); // Move onto next chain item
	};

	this.progressDefaults = function() {
		var calledAs = this._getOverload(arguments);
		switch(calledAs) {
			case '':
				// Pass
				break;
			case 'object':
				this._struct.push({
					type: 'progressDefaults',
					payload:  arguments[0],
				});
				break;
			default:
				throw new Error('Unsupported call type for async-chainable-progress/progressDefaults: ' + calledAs);
		}

		return this;
	};
	// }}}

	// .progressComplete {{{
	this.progressComplete = function() {
		var calledAs = this._getOverload(arguments);
		switch(calledAs) {
			case '':
				this._struct.push({type: 'progressComplete'});
				break;
			case 'string': // Form: progressComplete(name)
				this._struct.push({type: 'progressComplete', ids: [arguments[0]]});
				break;
			case 'array': // Form: progressComplete(names)
				this._struct.push({type: 'progressComplete', ids: arguments[0]});
				break;
			default:
				throw new Error('Unsupported call type for async-chainable-progress/progressComplete: ' + calledAs);
		}

		return this;
	}

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
};
