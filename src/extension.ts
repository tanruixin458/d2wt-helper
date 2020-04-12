import * as vscode from 'vscode';
import path = require('path');
import { KVCompletionItemProvider } from './provider/KVCompletionItemProvider';
import { KVEditorProvider } from './provider/KVEditorProvider';

export let fjsonObj: any;

// 插件被激活
export function activate(context: vscode.ExtensionContext) {
	console.log("d2wt-helper被激活");

	// 载入json资源
	let extensionPath = context.extensionPath;
	let fileUri = vscode.Uri.file(path.join(extensionPath, "res", "abilityKV.json"));
	let file = vscode.workspace.fs.readFile(fileUri);
	file.then(function (value) {
		// 完成态
		let readData = Buffer.from(value).toString('UTF-8');
		let jsonObj = JSON.parse(readData);
		fjsonObj = jsonObj;
	}, function (error) {
		// 失败态
	});
	
	// 注册KV自动补全功能
	context.subscriptions.push(KVCompletionItemProvider.register(context));
	console.log("KV自动补全功能被激活");

	// 注册KV可视化编辑器功能
	context.subscriptions.push(KVEditorProvider.register(context));
	console.log("KV可视化编辑器功能被激活");
}

// 插件被停用
export function deactivate() {
	console.log("d2wt-helper被停用");
}