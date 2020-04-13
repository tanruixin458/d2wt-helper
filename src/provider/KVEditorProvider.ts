import * as vscode from 'vscode';
import * as path from 'path';

export class KVEditorProvider implements vscode.CustomTextEditorProvider {
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new KVEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(KVEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = "d2wt-helper.kv-editor";

	constructor(
		private readonly context: vscode.ExtensionContext
	) {}

	public resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
		// 初始化界面
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: "update",
				text: document.getText()
			});
		}

		let changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		webviewPanel.webview.onDidReceiveMessage(e => {
			console.log(e);
			switch (e.type) {
				case "add":
					return;
				case "delete":
					return;
				case "log":
					return;
			}
		});

		updateWebview();
	}

	// 获取html
	private getHtmlForWebview(webview: vscode.Webview): string {
		let extensionPath = this.context.extensionPath;
		let scriptUri1 = webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "res", "web", "KVEditor.js")));
		let scriptUri2 = webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "res", "web", "KVUtils.js")));
		let scriptUri3 = webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "res", "web", "KV.js")));
		let styleUri = webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "res", "web", "KVEditor.css")));

		let nonce = this.getNonce();

		return `<!DOCTYPE html>
				<html>
				<head>
					<meta charset="UTF-8">
					<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<link href="${styleUri}" rel="stylesheet" />
					<title>KV Editor</title>
				</head>
				<body>
					<div id="error"></div>
					<script nonce="${nonce}" src="${scriptUri1}"></script>
					<script nonce="${nonce}" src="${scriptUri2}"></script>
					<script nonce="${nonce}" src="${scriptUri3}"></script>
					</body>
				</html>`;
	}

	// 获取随机码
	private getNonce() {
		let text = "";
		const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}
}