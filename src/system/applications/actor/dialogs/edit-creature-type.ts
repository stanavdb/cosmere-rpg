import { CreatureType } from '@system/types/cosmere';
import { CosmereActor } from '@system/documents';
import { AnyObject } from '@system/types/utils';

import { CommonActorData } from '@system/data/actor/common';

// Utils
import ActorUtils from '@system/util/actor';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class EditCreatureTypeDialog extends HandlebarsApplicationMixin(
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
                title: 'COSMERE.Actor.Sheet.EditType',
                minimizable: false,
                positioned: true,
            },
            classes: ['dialog', 'edit-creature-type'],
            tag: 'dialog',
            position: {
                width: 300,
            },
            actions: {
                'update-type': this.onUpdateType,
            },
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            form: {
                template:
                    'systems/cosmere-rpg/templates/actors/adversary/dialogs/edit-creature-type.hbs',
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

    private type: CommonActorData['type'];

    private constructor(private actor: CosmereActor) {
        super({
            id: `${actor.uuid}.type`,
        });

        this.type = actor.system.type;
    }

    /* --- Statics --- */

    public static async show(actor: CosmereActor) {
        await new EditCreatureTypeDialog(actor).render(true);
    }

    /* --- Actions --- */

    private static onUpdateType(this: EditCreatureTypeDialog) {
        void this.actor.update({
            'system.type': this.type,
        });
        void this.close();
    }

    /* --- Form --- */

    private static onFormEvent(
        this: EditCreatureTypeDialog,
        event: Event,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        console.log(formData.object, event, form);
        const target = event.target as HTMLInputElement;

        if (formData.object.custom && target.name !== 'primaryType') {
            this.type.id = CreatureType.Custom;
            this.type.custom = formData.object.custom as string;
        } else {
            this.type.id = formData.object.primaryType as CreatureType;
            this.type.custom = null;
        }

        this.type.subtype = formData.object.subtype as string;

        // Render
        if (!(event instanceof SubmitEvent)) void this.render(true);
    }

    /* --- Lifecycle --- */

    protected _onRender(): void {
        $(this.element).prop('open', true);
    }

    /* --- Context --- */

    protected _prepareContext() {
        // Get list of all configured types
        const configuredTypes = Object.entries(
            CONFIG.COSMERE.creatureTypes,
        ).map(([id, config]) => ({
            id,
            ...config,
            selected: (this.type.id as string) === id,
        }));

        return Promise.resolve({
            actor: this.actor,
            type: this.type,

            typeLabel: ActorUtils.getTypeLabel(this.type),
            configuredTypes,
        });
    }
}
