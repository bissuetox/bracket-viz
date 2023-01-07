import { Bracket, isMatchingBracket, LevelString } from './bracket';
import * as vscode from 'vscode';
const delimOpen = ['{', '(', '[', '<'];
const delimClosed = ['}', ')', ']', '>'];
const fillerCharacter = ' ';
const myScheme = 'bracket-viz';
const peekWindowTitle = "Bracket Visualization";

export function activate(context: vscode.ExtensionContext) {
	// Use editor? to prevent error for possible undefined value
	const myProvider = new class implements vscode.TextDocumentContentProvider {
		onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
		onDidChange = this.onDidChangeEmitter.event;
		provideTextDocumentContent(uri: vscode.Uri): string {
			// Peek Title is the uri path
			// Parse query text so title can be separate
			const queryText = uri.query;
			const vizText = visualizeBrackets(queryText)!;
			return vizText;
		}
	};
	
	let vizDisplosable = vscode.commands.registerCommand('bracket-viz.visualizeBrackets', async () => {
		const editor = vscode.window.activeTextEditor; // Must instantiate each time since active editor can change
		const selectedText = editor?.document.getText(editor.selection);
		if (selectedText === undefined || selectedText.length < 2) {
			vscode.window.showInformationMessage(`Invalid selection!`);
		} else if (selectedText.indexOf('\n') !== -1) {
			vscode.window.showInformationMessage(`Cannot visualize multi line input!`);
		} else {
			const thisUri = editor?.document.uri;
			const uri = vscode.Uri.parse(`${myScheme}:${peekWindowTitle}?${selectedText}`);
			const start = editor?.selection.start.character;
			const line = editor?.selection.start.line;
			const pos = new vscode.Position(line!, start!);
			const loc = new vscode.Location(uri, new vscode.Position(0, 1));
			vscode.commands.executeCommand('editor.action.peekLocations', thisUri, pos, [loc]);
		}
	});

	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));
	context.subscriptions.push(vizDisplosable);
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

export function deactivate() {}
