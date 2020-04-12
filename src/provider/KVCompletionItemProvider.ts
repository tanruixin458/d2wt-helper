import * as vscode from 'vscode';
import { fjsonObj } from '../extension';

export class KVCompletionItemProvider implements vscode.CompletionItemProvider {
	public static register(context: vscode.ExtensionContext): vscode.Disposable { 
		const provider = new KVCompletionItemProvider(context);
		const providerRegistration = vscode.languages.registerCompletionItemProvider(KVCompletionItemProvider.selector, provider, ...KVCompletionItemProvider.triggerCharacters)
		return providerRegistration;
	}

	private static readonly selector = "key-value";

	private static readonly triggerCharacters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
												 "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
												 "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
												 "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

	constructor(
		private readonly context: vscode.ExtensionContext
	) {}

	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
		if (context.triggerKind == vscode.CompletionTriggerKind.TriggerCharacter) {
			let line = document.lineAt(position).text.substring(0, position.character).trim();

			let array = line.match(/"\S+"/g);
			if (array) {
				let key = array[0].replace(/"/g, "");

				// 读取枚举列表
				let jsonObj = fjsonObj;

				let result = [];
				for (let enumType in jsonObj) {
					if (enumType == key) {
						let subObj = jsonObj[enumType];
						for (let enumName in subObj) {
							let item = new vscode.CompletionItem(enumName, vscode.CompletionItemKind.Enum);
							item.documentation = subObj[enumName];
							item.detail = subObj[enumName];
							result.push(item);
						}
					}
				}
				return result;
			} else {
				// 匹配错误
				return null;
			}
		}
		return null;
	}
}