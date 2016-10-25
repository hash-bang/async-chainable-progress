async-chainable-progress
========================
Plugin for [async-chainable](https://github.com/hash-bang/async-chainable) that adds progress bars, spinners and other widgets.


	var asyncChainable = require('async-chainable');
	var asyncChainableProgress = require('async-chainable-progress');

	// Display a manually updated progress bar
	asyncChainable()
		.use(asyncChainableProgress)
		.progress()
		.then(function(next) { setTimeout(next, 1000) })
		.progress(50)
		.then(function(next) { setTimeout(next, 1000) })
		.progress(100)
		.then(function(next) { setTimeout(next, 1000) })
		.progressComplete() // Remove the progress bars
		.end();


	// Display a labeled progress bar and update it within a complex operation
	asyncChainable()
		.use(asyncChainableProgress)
		.progress(null, 'Doing things')
		.then(function(next) {
			// Assume a really time consuming process
			for (var p = 0; p < 100; p++) {
				this.setProgress(p);
			}
		})
		.progressComplete()
		.end();


	// Display a list of current actions where each action has a progress bar and gets ticked off on completion
	asyncChainable()
		.use(asyncChainableProgress)
		.progress(null, 'Doing things 1')
		.then(function(next) {
			// Assume a really time consuming process
			for (var p = 0; p < 100; p++) {
				this.setProgress(p);
			}
		})
		.progressComplete()
		.tick('Doing things 1')
		.progress(null, 'Doing things 2')
		.then(function(next) {
			// Assume a really time consuming process
			for (var p = 0; p < 100; p++) {
				this.setProgress(p);
			}
		})
		.progressComplete()
		.tick('Doing things 2')
		.end();


See the [examples folder](examples) for more examples.


Function reference
==================
async-chainable-progress extends async-chainable in with the following functions.

.progress()
-----------
Create or update a progress bar.

	progress() // Create an anonymous unlabeled progress bar
	progress(String <id>) // Create an ID'd progress bar
	progress(String <id>, String <text>) // Create a ID'd and labeled progress bar
	progress(Null, String <text>) // Create a labeled progress bar
	progress(Number <progress>) // Update the anonymous (non ID'd) progress bar progress
	progress(String <id>, Number <progress>) // Update the anonymous (non ID'd) progress bar progress
	progress(String <id>, Number <progress>, Number <max_progress>) // As above but also set the max progress (otherwise `100` is assumed)

If no ID parameter is specified 'anonBar' is assumed automatically.


.spinner()
----------
Create or update a spinner - useful for when specific progress is unknown.

	spinner() // Create an anonymous unlabled spinner
	spinner(String <id>) // Create an ID'd spinner
	spinner(String <id>, String <text>) // Create a ID'd and labeled progress bar
	spinner(Null, String <text>) // Create a labeled spinner

If no id parameter is specified 'anonSpinner' is assumed automatically.


.tick()
-------
Add a tick mark to the console output to signify that a task has completed.

	tick(String <text>) // Create a tick with the specific text
	tick(String <text>, String <status>) // Create a tick with the specific text and a custom status.
	
Valid tick statuses are: 'ok', 'fail', 'pending' or any others listed in `this._progressDefaults.tick`.


.progressDefaults()
-------------------
Override the default options when creating progress bars / spinners or other widgets.

	progressDefaults(Object) // Append the specified options into the default object

See the `this._progressDefaults` object for more details on the structure of this object.


.progressComplete()
-------------------
Indicate that either all or a specific progress action has completed and that its widget should be removed from the output.

	progressComplete() // Remove all widgets
	progressComplete(String <id>) // Remove a specific single widget
	progressComplete(Array <ids>) // Remove all specified widgets


.setProgress()
--------------
Used within the `this` object to update progress while within a async-chainable task.

	this.setProgress() // Redraw all widgets - includes moving spinners on by a frame
	this.setProgress(Number <progress>) // Update the 'anonBar' progress item to the specified progress
	this.setProgress(Number <progress>, Number <max_progress>) // As above but also set the max progress (otherwise `100` is assumed)

