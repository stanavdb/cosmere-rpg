export interface PlotDieData {
    /**
     * The number of dice of this term to roll 
     * @default 1
     */
    number?: number;

    /**
     * An optional array of pre-cast results for the term
     */
    results?: any[];
}

export class PlotDie extends foundry.dice.terms.DiceTerm {
    constructor(data: PlotDieData = {}) {
        super({
            ...data,
            faces: 6
        });
    }

    static DENOMINATION = 'p';

    static MODIFIERS = {
        'r': foundry.dice.terms.Die.prototype.reroll,
        'rr': foundry.dice.terms.Die.prototype.rerollRecursive,
        'k': foundry.dice.terms.Die.prototype.keep,
        'kh': foundry.dice.terms.Die.prototype.keep,
        'kl': foundry.dice.terms.Die.prototype.keep,
        'd': foundry.dice.terms.Die.prototype.drop,
        'dh': foundry.dice.terms.Die.prototype.drop,
        'dl': foundry.dice.terms.Die.prototype.drop
    } as any;

    async roll({ minimize=false, maximize=false, ...options } = {}) {
        const roll = { result: undefined, active: true } as any;
        if (minimize) roll.result = 1;
        else if (maximize) roll.result = 6;
        else roll.result = await this._roll(options);

        if (roll.result === undefined) roll.result = this.randomFace();
        if (roll.result <= 2) roll.failure = true;
        else {
            if (roll.result >= 5) roll.success = true;
            roll.result = 0;
        }
        this.results.push(roll);

        return roll;
    }

    getResultLabel(result: foundry.dice.terms.DiceTerm.Result): string {
        if (result.failure) return `complication (${result.result * 2})`;
        else if (result.success) return 'opporunity';
        else return '-'
    }
}