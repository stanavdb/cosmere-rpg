import { Attribute } from '@system/types/cosmere';
import { RollMode } from '@system/dice/types';
import { AdvantageMode } from '@system/types/roll';
import { AnyObject, NONE, Noneable } from '@system/types/utils';
import { isNone } from '@src/system/utils/generic';

import { D20RollData } from '@system/dice/d20-roll';

// Mixins
import { ComponentHandlebarsApplicationMixin } from '@system/applications/component-system';

const { ApplicationV2 } = foundry.applications.api;

const DICE_PART_REGEX = /^\d+d\d+$/;
const ADVANTAGE_MODE_COLORS = {
    [AdvantageMode.Disadvantage]: 'rgb(118 43 43)',
    [AdvantageMode.Advantage]: 'rgb(49 69 118)',
    [AdvantageMode.None]: null,
};

export namespace RollConfigurationDialog {
    export interface Data {
        /**
         * The title of the dialog window
         */
        title: string;

        /**
         * The formulas of the roll
         */
        parts: string[];

        /**
         * A dice formula stating any miscellaneous other bonuses or negatives to the specific roll
         */
        temporaryModifiers?: string;

        /**
         * The data to be used when parsing the roll
         */
        data: D20RollData;

        /**
         * Whether or not to include a plot die in the roll
         */
        plotDie?: boolean;

        /**
         * The attribute that is used for the roll by default
         */
        defaultAttribute?: Noneable<Attribute>;

        /**
         * The roll mode that should be selected by default
         */
        defaultRollMode?: RollMode;

        /**
         * What advantage modifier to apply to the d20 roll
         */
        advantageMode?: AdvantageMode;

        /**
         * What advantage modifer to apply to the plot die roll
         */
        advantageModePlot?: AdvantageMode;
    }

    export interface Result {
        attribute: Noneable<Attribute>;
        rollMode: RollMode;
        plotDie: boolean;
        advantageMode: AdvantageMode;
        advantageModePlot: AdvantageMode;
        temporaryModifiers: string;
    }
}

export class RollConfigurationDialog extends ComponentHandlebarsApplicationMixin(
    ApplicationV2<AnyObject>,
) {
    /**
     * NOTE: Unbound methods is the standard for defining actions and forms
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            window: {
                minimizable: false,
                positioned: true,
            },
            classes: ['dialog', 'roll-configuration'],
            tag: 'dialog',
            position: {
                width: 500,
            },
            actions: {
                submit: this.onSubmit,
            },
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            form: {
                template:
                    'systems/cosmere-rpg/templates/roll/dialogs/d20-config.hbs',
                forms: {
                    form: {
                        handler: this.onFormEvent,
                        submitOnChange: true,
                    },
                },
            },
        },
    );
    /* eslint-enable @typescript-eslint/unbound-method */

    private submitted = false;
    private originalFormulaSize = 0;

    private constructor(
        private data: RollConfigurationDialog.Data,
        private resolve: (value: RollConfigurationDialog.Result | null) => void,
    ) {
        super({
            window: {
                title: data.title,
            },
        });

        this.originalFormulaSize = this.data.parts.length;
        this.data.advantageMode ??= AdvantageMode.None;
        this.data.advantageModePlot ??= AdvantageMode.None;
    }

    /* --- Statics --- */

    public static show(data: RollConfigurationDialog.Data) {
        return new Promise<RollConfigurationDialog.Result | null>((resolve) => {
            void new this(data, resolve).render(true);
        });
    }

    /* --- Form --- */

    private static onFormEvent(
        this: RollConfigurationDialog,
        event: Event,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        if (event instanceof SubmitEvent) return;

        const attribute = formData.get('attribute') as Noneable<Attribute>;
        const rollMode = formData.get('rollMode') as RollMode;
        const plotDie = formData.get('plotDie') === 'true';
        const tempMod = formData.get('temporaryMod')?.valueOf() as string;

        // get rid of existing temp mod formula
        if (this.data.parts.length > this.originalFormulaSize)
            this.data.parts.pop();
        // add the current ones in for display in the formula bar
        this.data.parts.push(tempMod);
        // store it
        this.data.temporaryModifiers = tempMod;

        const skill = this.data.data.skill;
        const attributeData = !isNone(attribute)
            ? this.data.data.attributes[attribute]
            : { value: 0, bonus: 0 };
        const rank = skill.rank;
        const value = attributeData.value + attributeData.bonus;

        this.data.data.mod = rank + value;
        this.data.defaultAttribute = !isNone(attribute) ? attribute : undefined;
        this.data.defaultRollMode = rollMode;
        this.data.plotDie = plotDie;

        void this.render();
    }

    /* --- Actions --- */

    protected static onSubmit(this: RollConfigurationDialog) {
        const form = this.element.querySelector('form')! as HTMLFormElement & {
            attribute: HTMLSelectElement;
            rollMode: HTMLSelectElement;
            plotDie: HTMLInputElement;
            temporaryMod: HTMLInputElement;
        };

        const attribute = form.attribute.value as Noneable<Attribute>;
        const rollMode = form.rollMode.value as RollMode;
        const plotDie = form.plotDie.checked;

        const advantageMode = this.data.advantageMode ?? AdvantageMode.None;
        const advantageModePlot =
            this.data.advantageModePlot ?? AdvantageMode.None;

        const temporaryModifiers = form.temporaryMod.value;

        this.resolve({
            attribute,
            rollMode,
            plotDie,
            advantageMode,
            advantageModePlot,
            temporaryModifiers,
        });
        this.submitted = true;
        void this.close();
    }

    /* --- Event handlers --- */

    protected onMultiStateToggleChange(event: Event) {
        const name = $(event.target!).attr('name')!;
        const value = $(event.target!).attr('value')!;

        const obj = foundry.utils.expandObject({ [name]: value });

        // Apply
        this.data = foundry.utils.mergeObject(this.data, obj);
    }

    /* --- Lifecycle --- */

    protected _onRender(context: AnyObject, options: AnyObject) {
        super._onRender(context, options);

        $(this.element).prop('open', true);
        $(this.element)
            .find('app-multi-state-toggle')
            .on('change', this.onMultiStateToggleChange.bind(this));
    }

    protected _onClose() {
        if (!this.submitted) this.resolve(null);
    }

    /* --- Context --- */

    protected _prepareContext() {
        const formula = foundry.dice.Roll.replaceFormulaData(
            this.data.parts
                .join(' + ')
                .replace(/\+ -/g, '-')
                .replace(/\+ \+/g, '+'),
            this.data.data,
            {
                missing: '0',
            },
        );

        return Promise.resolve({
            formula,
            dice: this.data.parts.find((part) => DICE_PART_REGEX.test(part))!,
            defaultRollMode: this.data.defaultRollMode,
            defaultAttribute: this.data.defaultAttribute,
            plotDie: this.data.plotDie,
            advantageMode: this.data.advantageMode,
            advantageModePlot: this.data.advantageModePlot,
            temporaryModifiers: this.data.temporaryModifiers,

            rollModes: CONFIG.Dice.rollModes,
            advantageModes: Object.entries(
                CONFIG.COSMERE.dice.advantageModes,
            ).reduce(
                (acc, [key, label]) => ({
                    ...acc,
                    [key]: {
                        label: label,
                        color: ADVANTAGE_MODE_COLORS[key as AdvantageMode],
                    },
                }),
                {},
            ),
            attributes: {
                [NONE]: 'GENERIC.None',
                ...Object.entries(CONFIG.COSMERE.attributes).reduce(
                    (acc, [key, config]) => ({
                        ...acc,
                        [key]: config.label,
                    }),
                    {},
                ),
            },
        });
    }
}
