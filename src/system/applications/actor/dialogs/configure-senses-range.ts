import { CosmereActor } from '@system/documents';
import { AnyObject } from '@system/types/utils';

import { CommonActorData } from '@system/data/actor/common';
import { Derived } from '@system/data/fields';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ConfigureSensesRangeDialog extends HandlebarsApplicationMixin(
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
            classes: ['dialog', 'configure-senses-range'],
            tag: 'dialog',
            position: {
                width: 300,
            },
            actions: {
                'update-sense': this.onUpdateSensesRange,
            },
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            form: {
                template:
                    'systems/cosmere-rpg/templates/actors/dialogs/configure-senses-range.hbs',
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

    private sensesData: CommonActorData['senses'];
    private mode: Derived.Mode;

    private constructor(private actor: CosmereActor) {
        super({
            id: `${actor.uuid}.SensesRange`,
            window: {
                title: game
                    .i18n!.localize('DIALOG.ConfigureSensesRange.Title')
                    .replace('{actor}', actor.name),
            },
        });

        this.sensesData = this.actor.system.senses;
        this.sensesData.range.override ??= this.sensesData.range.value ?? 0;
        this.mode = Derived.getMode(this.sensesData.range);
    }

    /* --- Statics --- */

    public static async show(actor: CosmereActor) {
        await new ConfigureSensesRangeDialog(actor).render(true);
    }

    /* --- Actions --- */

    private static onUpdateSensesRange(this: ConfigureSensesRangeDialog) {
        void this.actor.update({
            'system.senses': this.sensesData,
        });
        void this.close();
    }

    /* --- Form --- */

    private static onFormEvent(
        this: ConfigureSensesRangeDialog,
        event: Event,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        if (event instanceof SubmitEvent) return;

        // Get event target
        const target = event.target as HTMLInputElement;

        // Get mode
        this.mode = formData.object.mode as Derived.Mode;

        // Assign mode
        Derived.setMode(this.sensesData.range, this.mode);

        // Assign range
        if (this.mode === Derived.Mode.Override && target.name === 'range')
            this.sensesData.range.override = formData.object.range as number;

        // Assign obscured affected
        if (
            this.mode === Derived.Mode.Override &&
            target.name === 'obscuredUnaffected'
        ) {
            this.sensesData.range.override = formData.object.obscuredUnaffected
                ? Number.MAX_VALUE
                : 0;
        }

        // Render
        void this.render(true);
    }

    /* --- Lifecycle --- */

    protected _onRender(): void {
        $(this.element).prop('open', true);
    }

    /* --- Context --- */

    protected _prepareContext() {
        return Promise.resolve({
            actor: this.actor,
            mode: this.mode,
            modes: Derived.Modes,
            ...this.sensesData,
        });
    }
}
