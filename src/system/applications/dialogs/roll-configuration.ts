import { Attribute } from '@system/types/cosmere';
import { CosmereActorRollData } from '@system/documents/actor';
import { RollMode } from '@system/dice/types';
import { AnyObject } from '@system/types/utils';

import { D20RollData } from '@system/dice/d20-roll';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

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
        defaultAttribute?: Attribute;

        /**
         * The roll mode that should be selected by default
         */
        defaultRollMode?: RollMode;
    }

    export interface Result {
        attribute: Attribute;
        rollMode: RollMode;
        plotDie: boolean;
    }
}

export class RollConfigurationDialog extends HandlebarsApplicationMixin(
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
                width: 400,
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
                template: 'systems/cosmere-rpg/templates/roll/dialog.hbs',
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

    private constructor(
        private data: RollConfigurationDialog.Data,
        private resolve: (value: RollConfigurationDialog.Result | null) => void,
    ) {
        super({
            window: {
                title: data.title,
            },
        });
    }

    /* --- Statics --- */

    public static show(data: RollConfigurationDialog.Data) {
        return new Promise<RollConfigurationDialog.Result | null>((resolve) => {
            const dialog = new this(data, resolve);
            void dialog.render(true);
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

        const attribute = formData.get('attribute') as Attribute;
        const rollMode = formData.get('rollMode') as RollMode;
        const plotDie = formData.get('plotDie') === 'true';

        if (attribute !== this.data.defaultAttribute) {
            const skill = this.data.data.skill;
            const attributeData = this.data.data.attributes[attribute];
            const rank = skill.rank;
            const value = attributeData.value;

            this.data.data.mod = rank + value;
            this.data.defaultAttribute = attribute;
            this.data.defaultRollMode = rollMode;
            this.data.plotDie = plotDie;

            void this.render();
        }
    }

    /* --- Actions --- */

    protected static onSubmit(this: RollConfigurationDialog) {
        const form = this.element.querySelector('form')! as HTMLFormElement & {
            attribute: HTMLSelectElement;
            rollMode: HTMLSelectElement;
            plotDie: HTMLInputElement;
        };

        const attribute = form.attribute.value as Attribute;
        const rollMode = form.rollMode.value as RollMode;
        const plotDie = form.plotDie.checked;

        this.resolve({ attribute, rollMode, plotDie });
        this.submitted = true;
        void this.close();
    }

    /* --- Lifecycle --- */

    protected _onRender() {
        $(this.element).prop('open', true);
    }

    protected _onClose() {
        if (!this.submitted) this.resolve(null);
    }

    /* --- Context --- */

    protected _prepareContext() {
        const formula = foundry.dice.Roll.replaceFormulaData(
            this.data.parts.join(' + '),
            this.data.data,
            {
                missing: '0',
            },
        );

        return Promise.resolve({
            formula,
            defaultRollMode: this.data.defaultRollMode,
            defaultAttribute: this.data.defaultAttribute,
            plotDie: this.data.plotDie,
            rollModes: CONFIG.Dice.rollModes,
            attributes: Object.entries(CONFIG.COSMERE.attributes).reduce(
                (acc, [key, config]) => ({
                    ...acc,
                    [key]: config.label,
                }),
                {},
            ),
        });
    }
}
