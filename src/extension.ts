import { Bracket, BracketPair, isMatchingBracket, LevelString } from './bracket';
import internal = require('stream');
import * as vscode from 'vscode';
import { ConsoleReporter } from '@vscode/test-electron';
const editor = vscode.window.activeTextEditor;
const delimOpen = ['{', '(', '[', '<'];
const delimClosed = ['}', ')', ']', '>'];

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
	let pairs: Array<BracketPair> = [];

	try {
		let level = 1;
		let maxLevel = 1;

		// Iterate through the string and gather bracket pairs
		for (let idx=0; idx < s.length; ++idx) {
			let char = s[idx];

			// If opening delimiter
			if (delimOpen.indexOf(char) !== -1) {
				let openBracket = new Bracket(char, "open", idx, idx, s.length - idx);
				stack.push(openBracket);
				// console.log(`lvl ${level} : ${char}. inc lvl to ${level + 1}`);
				++level;
			}

			// If closing delimiter
			if (delimClosed.indexOf(char) !== -1) {
				// Bracket stack empty
				if (stack.length === 0) {
					console.error("No opening brackets to match! (Stack empty)");
					return;
				}
				// Open / closed bracket doesn't match
				let topStack: Bracket = stack[stack.length - 1];
				if (!isMatchingBracket(topStack.token, char)) {
					console.error("Bracket mismatch!");
					return;
				}
				--level;
				console.log(`Registered closing ${char} to lvl ${level}`);

				// Form a pair and add to pairs
				let closedBracket = new Bracket(char, "closed", idx, idx, s.length - idx);
				let openBracket = stack.pop();
				let thisPair = new BracketPair(openBracket!, closedBracket, level);
				pairs.push(thisPair);
			}

			// Track max level
			if (level >= maxLevel) {
				maxLevel = level;
			}
		}

		console.log('Done scanning...');

		// O(n^3) - improve this?
		// Print each level
		let levelString: LevelString = new LevelString(s);
		for (let lvl=maxLevel; lvl > 0; --lvl) {

			// Iterate through each character of the string, set inside paren's characters to that levelString's level attribute
			for(let idx=0; idx < s.length; ++idx) {
				let validLevelChar = false;

				// Check pairs if current char is inside of one
				pairs.forEach((pair) => {
					// If on same level and outside parens - set that level
					if (pair.level === lvl && (idx <= pair.openBracket.idx || pair.closedBracket.idx <= idx)) {
						validLevelChar = true;
					}
				});

				// If level has yet to be assigned, assign it to this level
				if (validLevelChar && levelString.getLevelAtIdx(idx) === -1) {
					console.log(`Set char ${s[idx]} to level ${lvl}`);
					levelString.setLevel(idx, lvl);
				}

			}
		}

		// Loop through each level
		for (let lvl=1; lvl <= maxLevel; lvl++) {
			// Loop through string
			let thisString = "";
			for(let idx=0; idx < s.length; ++idx) {
				if (levelString.getLevelAtIdx(idx) === lvl) {
					thisString += s[idx];
				} else {
					thisString += " ";
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