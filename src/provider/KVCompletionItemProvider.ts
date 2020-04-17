import * as vscode from 'vscode';
import * as fu from  '../utils/FileUtils';

export class KVCompletionItemProvider implements vscode.CompletionItemProvider {
	public static async register(context: vscode.ExtensionContext): Promise<vscode.Disposable> {
		let provider = new KVCompletionItemProvider(context);
		let providerRegistration = vscode.languages.registerCompletionItemProvider(KVCompletionItemProvider.selector, provider, ...KVCompletionItemProvider.triggerCharacters)
		console.log("KV自动补全功能被激活");

		// 预载入所需资源
		let fileRelativePath = "res/abilityKV.json";
		let fileContent = await fu.readExtensionFile(context, fileRelativePath);
		KVCompletionItemProvider.jsonObj = JSON.parse(fileContent);

		return providerRegistration;
	}

	private static jsonObj: any = null;

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
				let result = [];
				let subObj = KVCompletionItemProvider.jsonObj[key];
				if (subObj) {
					for (let enumName in subObj) {
						let item = new vscode.CompletionItem(enumName, vscode.CompletionItemKind.Enum);
						item.documentation = subObj[enumName];
						item.detail = subObj[enumName];
						result.push(item);
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