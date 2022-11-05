
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

export class BracketPair {
    public openBracket: Bracket;
    public closedBracket: Bracket;
    public level: number;

    constructor(open: Bracket, closed: Bracket, level: number) {
        this.openBracket = open;
        this.closedBracket = closed;
        this.level = level;
    }
}