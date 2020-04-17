import * as path from "path";
import * as vscode from "vscode";

export function rootDirectory(): vscode.Uri {
	let rootDir = vscode.workspace.workspaceFolders?.[0].uri;
	
	if (!rootDir) {
		let error = "VS Edu doesn't work if you don't have a folder open";
		vscode.window.showErrorMessage(error);
		throw new Error(error);
	}

	return rootDir;
}

export async function readWorkspaceFile(...file: string[]): Promise<string> {
	let f = await vscode.workspace.fs.readFile(
		vscode.Uri.file(
			path.join(rootDirectory().fsPath, ...file)
		)
	);

	return Buffer.from(f).toString('UTF-8');
}

export async function readExtensionFile(context: vscode.ExtensionContext, ...file: string[]): Promise<string> {
	let f = await vscode.workspace.fs.readFile(
		vscode.Uri.file(
			path.join(context.extensionPath, ...file)
		)
	);

	return Buffer.from(f).toString('UTF-8');
}

export function getExtensionFileUri(context: vscode.ExtensionContext, relativePath: string): vscode.Uri {
	return vscode.Uri.file(path.join(context.extensionPath, relativePath));
}

export function getExtensionFileString(context: vscode.ExtensionContext, relativePath: string) {
    return getExtensionFileUri(context, relativePath).with({ scheme: 'vscode-resource' }).toString();
}