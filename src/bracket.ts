export class Bracket {
	public token: string;
    public type: string;
	public idx: number;
	public spaceBefore: number;
	public spaceAfter: number;
	constructor(token:string, type: string, idx:number, sb:number, sa:number) {
		this.token = token;
        this.type = type;
		this.idx = idx;
		this.spaceBefore = sb;
		this.spaceAfter = sa;
	}
}
export function isMatchingBracket(open: string, close: string) {
    if (open === '{' && close === '}' ||
        open === '[' && close === ']' ||
        open === '<' && close === '>' ||
        open === '(' && close === ')') {
        return true;
    }
    return false;
}
export class LevelString {
    text: string;
    idxLevels: Array<number>;
    constructor(text: string) {
        this.text = text;
        this.idxLevels = new Array<number>(text.length - 1);
        // Initialize
        for(let i=0; i<text.length - 1; i++) {
            this.idxLevels[i] = -1;
        }
    }
    setLevel(idx: number, level: number) {
        this.idxLevels[idx] = level;
    }
    getLevelAtIdx(idx: number) {
        return this.idxLevels[idx];
    }
    getStringAtIdx(idx: number) {
        return this.text[idx];
    }
    getString() {
        return this.text;
    }
}