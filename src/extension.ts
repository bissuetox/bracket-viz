import { Bracket, BracketPair, isMatchingBracket, LevelString } from './bracket';
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
	
	let disposable = vscode.commands.registerCommand('bracket-viz.visualizeBrackets', () => {
		const text = editor?.document.getText(editor.selection);
		if (text === undefined || text.length < 2) {
			vscode.window.showInformationMessage(`Invalid text selected`);
		} else if (text.indexOf('\n') !== -1) {
			vscode.window.showInformationMessage(`Cannot visualize multi line input!`);
		} else {
			visualizeBrackets(text);
		}
	});

	context.subscriptions.push(disposable);
}

/*
Prog (                                     )
      EApp (              ) (             ) 
            EVar (      )    EVar (      )
                  Id "x"           Id "x"

*/

function visualizeBrackets(text: string | undefined) {
	vscode.window.showInformationMessage(`Text selected: ${text}`);
	let s: string = <string>text;
	let stack: Array<Bracket> = [];
	// let pairs: Array<BracketPair> = [];

	try {
		let level = 1;
		let maxLevel = 1;
		let levelString: LevelString = new LevelString(s);

		// Iterate through the string and gather bracket pairs
		// Assume it's fine - return if bad
		for (let idx=0; idx < s.length; ++idx) {
			let char = s[idx];

			// If opening delimiter
			if (delimOpen.indexOf(char) !== -1) {
				// Track bracket
				let openBracket = new Bracket(char, "open", idx, idx, s.length - idx);
				stack.push(openBracket);

				// Increment level and set levelString level
				levelString.setLevel(idx, level);
				++level;
			}

			// If closing delimiter
			else if (delimClosed.indexOf(char) !== -1) {
				// Check if bracket stack empty
				if (stack.length === 0) {
					console.error("No opening brackets to match! (Stack empty)");
					return;
				}
				// Check If Open / closed bracket doesn't match
				let topStack: Bracket = stack[stack.length - 1];
				if (!isMatchingBracket(topStack.token, char)) {
					console.error("Bracket mismatch!");
					return;
				}

				// Decrement level and set levelString level
				--level;
				levelString.setLevel(idx, level);
				// console.log(`Registered closing ${char} to lvl ${level}`);

				// Form a pair and add to pairs
				stack.pop();
				// let openBracket = stack.pop();
				// let closedBracket = new Bracket(char, "closed", idx, idx, s.length - idx);
				// let thisPair = new BracketPair(openBracket!, closedBracket, level);
				// pairs.push(thisPair);
			}

			else {
				levelString.setLevel(idx, level);
			}

			// Track max level
			if (level >= maxLevel) {
				maxLevel = level;
			}
		}

		console.log('Done scanning...');


		// Loop through each level
		for (let lvl=1; lvl <= maxLevel; lvl++) {
			// Loop through string
			let thisString = "";
			for(let idx=0; idx < s.length; ++idx) {
				// If char level is this iteration level, display it
				if (levelString.getLevelAtIdx(idx) === lvl) {
					thisString += s[idx];
				}
				// Otherwise show filler
				else {
					thisString += fillerCharacter;
				}
			}
			console.log(`lvl ${lvl}: ${thisString}`);
		}
		
	} catch (e) {
		console.error(e);
	}

}

// This method is called when your extension is deactivated
export function deactivate() {}