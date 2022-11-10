import { Bracket, isMatchingBracket, LevelString } from './bracket';
import internal = require('stream');
import * as vscode from 'vscode';
import { ConsoleReporter } from '@vscode/test-electron';
const editor = vscode.window.activeTextEditor;
const delimOpen = ['{', '(', '[', '<'];
const delimClosed = ['}', ')', ']', '>'];
const fillerCharacter = ' ';

export function activate(context: vscode.ExtensionContext) {
	console.log('bracket-viz is now active');
	// Use editor? to prevent error for possible undefined value
	const myScheme = 'bracket-viz';
	const myProvider = new class implements vscode.TextDocumentContentProvider {
		onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
		onDidChange = this.onDidChangeEmitter.event;
		provideTextDocumentContent(uri: vscode.Uri): string {
			return visualizeBrackets(uri.path)!;
		}
	};
	
	let disposable = vscode.commands.registerCommand('bracket-viz.visualizeBrackets', async () => {

		const text = editor?.document.getText(editor.selection);
		if (text === undefined || text.length < 2) {
			vscode.window.showInformationMessage(`Invalid text selected`);
		} else if (text.indexOf('\n') !== -1) {
			vscode.window.showInformationMessage(`Cannot visualize multi line input!`);
		} else {
			let returnedText = visualizeBrackets(text);
			const uri = vscode.Uri.parse(returnedText!);
			const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
			await vscode.window.showTextDocument(doc, { preview: false });
		}
	});

	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));

	context.subscriptions.push(disposable);
}

function visualizeBrackets(text: string | undefined) {
	let s: string = <string>text;
	let stack: Array<Bracket> = [];
	let retString = "";
	try {
		let level = 1;
		let maxLevel = 1;
		let levelString: LevelString = new LevelString(s);

		// Iterate through the string and verify bracket pairs
		for (let idx=0; idx < s.length; ++idx) {
			let char = s[idx];

			// If opening delimiter
			if (delimOpen.indexOf(char) !== -1) {
				let openBracket = new Bracket(char, "open", idx, idx, s.length - idx);
				stack.push(openBracket); // Add bracket to stack
				levelString.setLevel(idx, level);
				++level;
			}

			// If closing delimiter
			else if (delimClosed.indexOf(char) !== -1) {
				if (stack.length === 0) {
					vscode.window.showInformationMessage("No opening brackets to match!");
					return "No opening brackets to match!";
				}
				let topStack: Bracket = stack[stack.length - 1];
				if (!isMatchingBracket(topStack.token, char)) {
					vscode.window.showInformationMessage("Bracket mismatch!");
					return "Bracket mismatch!"; // Open / closed bracket mismatch
				}
				--level; // Decrement before set - put close in level above
				levelString.setLevel(idx, level);
				stack.pop();
			}
			// Else set level to current level
			else {
				levelString.setLevel(idx, level);
			}
			if (level >= maxLevel) {
				maxLevel = level;
			}
		}

		// Loop through each level
		for (let lvl=1; lvl <= maxLevel; lvl++) {
			// Loop through string
			let thisString = "";
			for(let idx=0; idx < s.length; ++idx) {
				// If char level is this iteration level, display it
				thisString += levelString.getLevelAtIdx(idx) === lvl ? s[idx] : fillerCharacter;
			}
			retString += `${thisString}\n`;
		}

		return retString;

	} catch (e) {
		vscode.window.showInformationMessage(`${e}`);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}