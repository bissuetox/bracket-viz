import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('bracket-viz is now active');

	const editor = vscode.window.activeTextEditor;
	const text = editor?.document.getText(editor.selection);

	let disposable = vscode.commands.registerCommand('bracket-viz.visualizeBrackets', () => {
		vscode.window.showInformationMessage(`Text: ${text}`);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
