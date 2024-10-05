import { Attribute, Skill } from '@system/types/cosmere';
import { CosmereActorRollData } from '@system/documents/actor';
import { AdvantageMode } from '@system/types/roll';

// Dialogs
import { RollConfigurationDialog } from '@system/applications/dialogs/roll-configuration';

import { PlotDie } from './plot-die';
import { RollMode } from './types';

// Constants
const CONFIGURATION_DIALOG_TEMPLATE =
    'systems/cosmere-rpg/templates/roll/dialog.hbs';
const DEFAULT_OPPORUNITY_VALUE = 20;
const DEFAULT_COMPLICATION_VALUE = 1;

// NOTE: Need to use type instead of interface here,
// as the generic of Roll doesn't handle interfaces properly

export type D20RollData<
    ActorRollData extends CosmereActorRollData = CosmereActorRollData,
> = {
    [K in keyof ActorRollData]: ActorRollData[K];
} & {
    mod: number;
    skill: {
        id: Skill;
        rank: number;
        mod: number;
        attribute: Attribute;
    };
    attribute: number;
};

export interface D20RollOptions
    extends Partial<foundry.dice.terms.RollTerm.EvaluationOptions> {
    rollMode?: RollMode;

    /**
     * The value of d20 result which represents an opportunity
     * @default 20
     */
    opportunity?: number;

    /**
     * The value of d20 result which represent an complication
     * @default 1
     */
    complication?: number;

    /**
     * Value against which the result of this roll should be compared
     */
    targetValue?: number;

    /**
     * Whether or not to include a plot die in the roll
     */
    plotDie?: boolean;

    /**
     * What advantage modifier to apply to the d20 roll
     * @default AdvantageMode.None
     */
    advantageMode?: AdvantageMode;

    /**
     * What advantage modifer to apply to the plot die roll
     */
    advantageModePlot?: AdvantageMode;

    /**
     * The attribute that is used for the roll by default
     */
    defaultAttribute?: Attribute;
}

export class D20Roll extends foundry.dice.Roll<D20RollData> {
    declare options: D20RollOptions & { configured: boolean };

    public constructor(
        protected parts: string[],
        data: D20RollData,
        options: D20RollOptions = {},
    ) {
        const formula = ['1d20'].concat(parts).join(' + ');
        super(formula, data, options);

        if (!this.options.configured) {
            this.configureModifiers();
        }
    }

    /* --- Accessors --- */

    /**
     * Does this roll start with a d20?
     */
    public get validD20Roll() {
        return (
            this.terms[0] instanceof foundry.dice.terms.Die &&
            this.terms[0].faces === 20
        );
    }

    /**
     * Whether or not to include a plot die in the roll
     */
    public get hasPlotDie() {
        return !!this.options.plotDie;
    }

    /**
     * Whether or not the d20 roll has advantage
     */
    public get hasAdvantage() {
        return this.options.advantageMode === AdvantageMode.Advantage;
    }

    /**
     * Whether or not the d20 roll has disadvantage
     */
    public get hasDisadvantage() {
        return this.options.advantageMode === AdvantageMode.Disadvantage;
    }

    /**
     * Whether or not the plot die roll has advantage
     */
    public get hasPlotAdvantage() {
        return this.options.advantageModePlot === AdvantageMode.Advantage;
    }

    /**
     * Whether or not the plot die roll has disadvantage
     */
    public get hasPlotDisadvantage() {
        return this.options.advantageModePlot === AdvantageMode.Disadvantage;
    }

    /**
     * How many complications were rolled?
     */
    public get complicationsCount() {
        if (!this._evaluated) {
            throw new Error('Roll not evaluated');
        }

        // Get d20s
        const d20s = this.dice.filter((die) => die.faces === 20);

        // Get plot dice
        const plotDice = this.dice.filter((die) => die instanceof PlotDie);

        // Get all dice that rolled a complication
        const d20Complications = d20s.filter(
            (die) =>
                die.results[0].result <=
                (this.options.complication ?? DEFAULT_COMPLICATION_VALUE),
        );
        const plotDiceComplications = plotDice.filter(
            (die) => die.results[0].failure === true,
        );

        // Return the count
        return d20Complications.length + plotDiceComplications.length;
    }

    /**
     * How many opportunities were rolled?
     */
    public get opportunitiesCount() {
        if (!this._evaluated) {
            throw new Error('Roll not evaluated');
        }

        // Get d20s
        const d20s = this.dice.filter((die) => die.faces === 20);

        // Get plot dice
        const plotDice = this.dice.filter((die) => die instanceof PlotDie);

        // Get all dice that rolled an opportunity
        const d20Opportunities = d20s.filter(
            (die) =>
                die.results[0].result >=
                (this.options.opportunity ?? DEFAULT_OPPORUNITY_VALUE),
        );
        const plotDiceOpportunities = plotDice.filter(
            (die) => die.results[0].success === true,
        );

        // Return the count
        return d20Opportunities.length + plotDiceOpportunities.length;
    }

    /**
     * Whether a complication was rolled (either on the plot die, or on the d20)
     */
    public get rolledComplication() {
        return this.complicationsCount > 0;
    }

    /**
     * Whether an opporunity was rolled (either on the plot die, or on the d20)
     */
    public get rolledOpportunity() {
        return this.opportunitiesCount > 0;
    }

    /**
     * Was an opporunity rolled on the d20?
     * Returns undefined if the roll isn't yet evaluated
     */
    public get hasRolledOpportunity() {
        if (!this.validD20Roll || !this._evaluated) return undefined;

        // Get the opporunity value
        const opporunity = this.options.opportunity ?? DEFAULT_OPPORUNITY_VALUE;

        if (!Number.isNumeric(opporunity)) return false;
        return this.dice[0].total! >= opporunity;
    }

    /**
     * Was a complication rolled on the d20?
     * Returns undefined if the roll isn't yet evaluated
     */
    public get hasRolledComplication() {
        if (!this.validD20Roll || !this._evaluated) return undefined;

        // Get the complication value
        const complication =
            this.options.complication ?? DEFAULT_COMPLICATION_VALUE;

        if (!Number.isNumeric(complication)) return false;
        return this.dice[0].total! <= complication;
    }

    /* --- Public Functions --- */

    public async configureDialog(
        data: Omit<RollConfigurationDialog.Data, 'parts'>,
    ): Promise<D20Roll | null> {
        // Show the dialog
        const result = await RollConfigurationDialog.show({
            ...data,
            parts: ['1d20', ...this.parts],
        });
        if (!result) return null;

        if (result.attribute !== this.options.defaultAttribute) {
            const skill = this.data.skill;
            const attribute = this.data.attributes[result.attribute];
            this.terms[2] = new foundry.dice.terms.NumericTerm({
                number: skill.rank + attribute.value,
            });
        }

        this.options.rollMode = result.rollMode;
        this.options.plotDie = result.plotDie;
        this.options.advantageMode = result.advantageMode;
        this.options.advantageModePlot = result.advantageModePlot;

        this.configureModifiers();
        return this;
    }

    public toMessage<
        T extends foundry.documents.BaseChatMessage.ConstructorData = Record<
            string,
            never
        >,
        Create extends boolean = true,
    >(
        messageData?: T,
        options?: Partial<{
            rollMode: keyof CONFIG.Dice.RollModes | 'roll';
            create: Create;
        }>,
    ): Promise<
        | (true extends Create
              ? ChatMessage.ConfiguredInstance | undefined
              : never)
        | (false extends Create ? foundry.dice.Roll.MessageData<T> : never)
    > {
        options ??= {};
        options.rollMode ??= this.options.rollMode;
        if (options.rollMode === 'roll') options.rollMode = undefined;
        options.rollMode ??= game.settings!.get('core', 'rollMode');

        return super.toMessage(messageData, options);
    }

    /* --- Internal Functions --- */

    private configureModifiers() {
        if (!this.validD20Roll) return;

        const d20 = this.terms[0] as foundry.dice.terms.Die;
        d20.modifiers = [];

        if (this.hasAdvantage) {
            d20.number = 2;
            d20.modifiers.push('kh');
        } else if (this.hasDisadvantage) {
            d20.number = 2;
            d20.modifiers.push('kl');
        } else {
            d20.number = 1;
        }

        if (this.hasPlotDie) {
            if (!this.terms.some((t) => t instanceof PlotDie)) {
                this.terms.push(
                    new foundry.dice.terms.OperatorTerm({
                        operator: '+',
                    }) as foundry.dice.terms.RollTerm,
                    new PlotDie() as foundry.dice.terms.RollTerm,
                );
            }

            // TODO: Figure out how to handle plot die advantage/disadvantage
            // const plotDieTerm = this.terms.find((t) => t instanceof PlotDie)!;
            // if (this.hasPlotAdvantage) {
            //     plotDieTerm.number = 2;
            //     plotDieTerm.modifiers.push('kh');
            // } else if (this.hasPlotDisadvantage) {
            //     plotDieTerm.number = 2;
            //     plotDieTerm.modifiers.push('kl');
            // }
        }

        // NOTE: Unused right now
        // if (!!this.options.targetValue) {
        //     (d20.options as any).targetValue = this.options.targetValue;
        // }

        // Re-compile the underlying formula
        this._formula = Roll.getFormula(this.terms);

        // Mark as configured
        this.options.configured = true;
    }
}
