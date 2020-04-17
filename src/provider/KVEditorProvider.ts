import * as vscode from 'vscode';
import * as path from 'path';
import * as fu from  '../utils/FileUtils';

export class KVEditorProvider implements vscode.CustomTextEditorProvider {
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		let provider = new KVEditorProvider(context);
		let providerRegistration = vscode.window.registerCustomEditorProvider(KVEditorProvider.viewType, provider);
		console.log("KV可视化编辑器功能被激活");

		// 预载入所需文件
		let htmlFileRelativePath = "res/web/html/main.html";
		fu.readExtensionFile(context, htmlFileRelativePath).then(function(fileContent) {
			let resourcePath = path.join(context.extensionPath, htmlFileRelativePath);
			let dirPath = path.dirname(resourcePath);
			KVEditorProvider.mainHTMLText = fileContent.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")((?!http).+?)"/g, (m, $1, $2) => {
				return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
			});
		});

		return providerRegistration;
	}

	private static mainHTMLText: string = "";

	private static readonly viewType = "d2wt-helper.kv-editor";

	constructor(
		private readonly context: vscode.ExtensionContext
	) {}

	public resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
		// 初始化界面
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = KVEditorProvider.mainHTMLText;

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
}