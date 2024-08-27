export interface PlotDieData
    extends Partial<foundry.dice.terms.DiceTerm.TermData> {
    /**
     * The number of dice of this term to roll
     * @default 1
     */
    number?: number;

    /**
     * An optional array of pre-cast results for the term
     */
    results?: foundry.dice.terms.DiceTerm.Result[];
}

export class PlotDie extends foundry.dice.terms.DiceTerm {
    constructor(data: PlotDieData = {}) {
        super({
            ...data,
            faces: 6,
        });
    }

    static DENOMINATION = 'p';

    static MODIFIERS = {
        r: foundry.dice.terms.Die.prototype.reroll.bind(this),
        rr: foundry.dice.terms.Die.prototype.rerollRecursive.bind(this),
        k: foundry.dice.terms.Die.prototype.keep.bind(this),
        kh: foundry.dice.terms.Die.prototype.keep.bind(this),
        kl: foundry.dice.terms.Die.prototype.keep.bind(this),
        d: foundry.dice.terms.Die.prototype.drop.bind(this),
        dh: foundry.dice.terms.Die.prototype.drop.bind(this),
        dl: foundry.dice.terms.Die.prototype.drop.bind(this),
    };

    async roll({ minimize = false, maximize = false, ...options } = {}) {
        const roll = {
            result: undefined,
            active: true,
        } as Partial<foundry.dice.terms.DiceTerm.Result>;
        if (minimize) roll.result = 1;
        else if (maximize) roll.result = 6;
        else roll.result = await this._roll(options);

        if (roll.result === undefined) roll.result = this.randomFace();
        if (roll.result <= 2) roll.failure = true;
        else {
            if (roll.result >= 5) roll.success = true;
            roll.result = 0;
        }

        const rollResult = roll as foundry.dice.terms.DiceTerm.Result;
        this.results.push(rollResult);
        return rollResult;
    }

    getResultLabel(result: foundry.dice.terms.DiceTerm.Result): string {
        if (result.failure)
            return `${game.i18n?.localize('DICE.Plot.Complication')} (${result.result * 2})`;
        else if (result.success)
            return `${game.i18n?.localize('DICE.Plot.Opportunity')}`;
        else return '-';
    }
}
