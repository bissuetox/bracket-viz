import { Bracket, BracketPair } from './bracket';
import internal = require('stream');
import * as vscode from 'vscode';
const editor = vscode.window.activeTextEditor;
const delimOpen = ['{', '(', '[', '<'];
const delimClosed = ['}', ')', ']', '>'];

export function activate(context: vscode.ExtensionContext) {
	console.log('bracket-viz is now active');

	// Use editor? to prevent error for possible undefined value
	const text = editor?.document.getText(editor.selection);

	let disposable = vscode.commands.registerCommand('bracket-viz.visualizeBrackets', () => {
		if (text === undefined || text.length < 2) {
			vscode.window.showInformationMessage(`Invalid text selected`);
		} else {
			visualizeBrackets(text);
		}
	});

	context.subscriptions.push(disposable);
}

function visualizeBrackets(text: string | undefined) {
	vscode.window.showInformationMessage(`Text selected: ${text}`);
	let s: string = <string>text;
	let stack: Array<Bracket> = [];
	let pairs: Array<BracketPair> = [];

	try {
		// Scrub Delimiters
		let level = 1;
		let maxLevel = 1;
		for (let idx=0; idx < s.length; ++idx) {
			let char = s[idx];
			if (delimOpen.indexOf(char) !== -1){
				let openBracket = new Bracket(char, "open", idx, idx, s.length - idx)
				stack.push(openBracket);
				level++;
			}
	
			if (delimClosed.indexOf(char) !== -1) {
				if (stack.length === 0) {
					console.log("Mismatched bracket!");
					break;
				}
				let closedBracket = new Bracket(char, "closed", idx, idx, s.length - idx);
				let openBracket = <Bracket>stack.pop();
				let thisPair = new BracketPair(openBracket, closedBracket, level);
				pairs.push(thisPair);
				level--;
			}

			if (level <= maxLevel) {
				maxLevel = level;
			}
		}

		let levelPairs = [];
		for (let i=1; i < maxLevel; ++i) {
			pairs.forEach((pair) => {
				console.log(pair.level);
			});
		}
	} catch (e) {
		console.error(e);
	}

}

// This method is called when your extension is deactivated
export function deactivate() {}