// @ts-check

// Script run within the webview itself.
(function() {
	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.

	// @ts-ignore
	let vscode = acquireVsCodeApi();

	function updateContent(text) {
		let kv;
		try {
			kv = kvRead(text, 0);
		} catch(error) {
			let e = document.getElementById("error");
			e.innerHTML = error;
			return;
		}
		vscode.postMessage({
			type: "log",
			log: kv
		});
	}

	// Handle messages sent from the extension to the webview
	window.addEventListener("message", event => {
		let message = event.data; // The json data that the extension sent
		switch (message.type) {
			case "update":
				let text = message.text;

				// Update our webview's content
				updateContent(text);

				// Then persist state information.
				// This state is returned in the call to `vscode.getState` below when a webview is reloaded.
				vscode.setState({text});
				return;
		}
	});

	// Webviews are normally torn down when not visible and re-created when they become visible again.
	// State lets us save information across these re-loads
	let state = vscode.getState();
	if (state) {
		updateContent(state.text);
	}
}());