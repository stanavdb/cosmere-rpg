import { Attribute, Skill } from '@system/types/cosmere';
import { CommonActorData } from '@system/data/actor/common';
import { AdvantageMode } from '@system/types/roll';
import { PlotDie } from './plot-die';
import { RollToMessageOptions, RollMode } from './types';

// Constants
const CONFIGURATION_DIALOG_TEMPLATE =
    'systems/cosmere-rpg/templates/roll/dialog.hbs';
const DEFAULT_OPPORUNITY_VALUE = 20;
const DEFAULT_COMPLICATION_VALUE = 1;

// NOTE: Need to use type instead of interface here,
// as the generic of Roll doesn't handle interfaces properly
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type D20RollData = {
    mod: number;
    skill: CommonActorData['skills'][Skill];
    attribute: CommonActorData['attributes'][Attribute];
    attributes: CommonActorData['attributes'];
    defaultAttribute: Attribute;
};

export interface D20RollOptions extends Partial<RollTerm.EvaluationOptions> {
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
}

interface RollDialogConfigurationData {
    /**
     * The title of the dialog window
     */
    title: string;

    /**
     * Whether or not to include a plot die in the roll
     */
    plotDie?: boolean;

    /**
     * The attribute that is used for the roll by default
     */
    defaultAttribute?: Attribute;

    /**
     * The roll mode that should be selected by default
     */
    defaultRollMode?: RollMode;
}

export class D20Roll extends Roll<D20RollData> {
    declare options: D20RollOptions & { configured: boolean };

    public constructor(
        formula: string,
        data: D20RollData,
        options: D20RollOptions = {},
    ) {
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
     * Was an opporunity rolled on the d20?
     * Returns undefined if the roll isn't yet evaluated
     */
    public get hasRolledOpportunity() {
        if (!this.validD20Roll || !this._evaluated) return undefined;

        // Get the opporunity value
        const opporunity = this.options.opportunity ?? DEFAULT_OPPORUNITY_VALUE;

        if (!Number.isNumeric(opporunity)) return false;
        return (this.dice[0].total as number) >= opporunity;
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
        return (this.dice[0].total as number) <= complication;
    }

    /* --- Public Functions --- */

    public async configureDialog(
        data: RollDialogConfigurationData,
    ): Promise<D20Roll | null> {
        // Deconstruct data
        const { title, defaultRollMode, defaultAttribute, plotDie } = data;

        // Render the dialog inner HTML
        const content = await renderTemplate(CONFIGURATION_DIALOG_TEMPLATE, {
            formulas: [{ formula: this.formula }],
            defaultRollMode,
            defaultAttribute,
            rollModes: CONFIG.Dice.rollModes,
            attributes: CONFIG.COSMERE.attributes,
            plotDie,
        });

        // Create promise that resolves when the dialog completes
        return new Promise((resolve) => {
            new Dialog({
                title,
                content,
                buttons: {
                    roll: {
                        label: 'Roll',
                        callback: (html) =>
                            resolve(this.processDialogSubmit($(html))),
                    },
                },
                default: 'roll',
                close: () => resolve(null),
            }).render(true);
        });
    }

    public toMessage(
        messageData: Partial<ChatMessage.MessageData> = {},
        options: RollToMessageOptions = {},
    ) {
        options.rollMode ??= this.options.rollMode;
        if (options.rollMode === 'roll') options.rollMode = undefined;
        options.rollMode ??= game.settings!.get('core', 'rollMode');

        // NOTE: Typing won't properly resolve due to overloads, have to any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
        return super.toMessage(messageData, options) as any;
    }

    /* --- Internal Functions --- */

    private processDialogSubmit(html: JQuery): D20Roll {
        const form = html[0].querySelector('form')! as HTMLFormElement & {
            attribute: HTMLSelectElement;
            rollMode: HTMLSelectElement;
            plotDie: HTMLInputElement;
        };

        if (
            (form.attribute.value as Attribute) !== this.data.defaultAttribute
        ) {
            const skill = this.data.skill;
            const attribute =
                this.data.attributes[form.attribute.value as Attribute];
            this.terms[2] = new NumericTerm({
                number: skill.rank + attribute.value,
            });
        }

        this.options.rollMode = form.rollMode.value as RollMode;
        this.options.plotDie = form.plotDie.checked;

        this.configureModifiers();

        return this;
    }

    private configureModifiers() {
        if (!this.validD20Roll) return;

        const d20 = this.terms[0] as unknown as foundry.dice.terms.Die;
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
                    }) as unknown as RollTerm,
                    new PlotDie() as unknown as RollTerm,
                );
            }

            const plotDieTerm = this.terms.find((t) => t instanceof PlotDie)!;

            if (this.hasPlotAdvantage) {
                plotDieTerm.number = 2;
                plotDieTerm.modifiers.push('kh');
            } else if (this.hasPlotDisadvantage) {
                plotDieTerm.number = 2;
                plotDieTerm.modifiers.push('kl');
            }
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
