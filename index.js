var _ = require('lodash');
var clui = require('clui');
var terminal = require('terminal-kit').terminal();

module.exports = function() {
	this._progressObjects = {};

	// .progress() {{{
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
						objRef: new clui.Progress(params.progress.width),
						max: params.progress.max,
						value: params.progress.value,
					}, item);
					break;
				default: throw new Error('Unknown async-chainable-progress type: ' + item.type);
			}
		}
		// }}}
		// Accept updated parameters {{{
		['value', 'max'].forEach(function(option) {
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
			}
		}
	};

	this.progress = function() {
		var calledAs = this._getOverload(arguments);
		switch(calledAs) {
			case '':
				this._struct.push({type: 'progress',
					type: 'progress',
					item: {
						id: 'anonBar',
						type: 'progressBar',
						value: 0,
					},
				});
				break;
			case 'string,array': // Form: progress(name, cmd + params)
				var args = arguments[1];
				args.id = arguments[0];
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
				throw new Error('Unsupported call type for async-chainable-progress: ' + calledAs);
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
};
