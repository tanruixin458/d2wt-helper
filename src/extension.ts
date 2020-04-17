import * as vscode from 'vscode';
import { KVCompletionItemProvider } from './provider/KVCompletionItemProvider';
import { KVEditorProvider } from './provider/KVEditorProvider';

// 插件被激活
export function activate(context: vscode.ExtensionContext) {
	console.log("d2wt-helper被激活");

	// 注册KV自动补全功能
	context.subscriptions.push(KVCompletionItemProvider.register(context));

	// 注册KV可视化编辑器功能
	context.subscriptions.push(KVEditorProvider.register(context));
}

// 插件被停用
export function deactivate() {
	console.log("d2wt-helper被停用");
}