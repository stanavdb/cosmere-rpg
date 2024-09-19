import { CosmereActor } from '@system/documents';
import { AnyObject, DeepPartial } from '@system/types/utils';

// Components
import { ActorSkillsGroupComponent } from '../components';

// Mixins
import { ComponentHandlebarsApplicationMixin } from '@system/applications/mixins';

const { ApplicationV2, DocumentSheetV2 } = foundry.applications.api;

export class ConfigureSkillsDialog extends ComponentHandlebarsApplicationMixin(
    ApplicationV2<AnyObject>,
) {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            window: {
                title: 'COSMERE.Actor.Sheet.ConfigureSkills',
                minimizable: false,
                positioned: true,
            },
            classes: ['dialog', 'configure-skills'],
            tag: 'dialog',
            position: {
                width: 400,
            },
        },
    );

    static COMPONENTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.COMPONENTS),
        {
            'app-actor-skills-group': ActorSkillsGroupComponent,
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            form: {
                template:
                    'systems/cosmere-rpg/templates/actors/adversary/dialogs/configure-skills.hbs',
            },
        },
    );

    private constructor(private actor: CosmereActor) {
        super({
            id: `${actor.uuid}.skills`,
        });
    }

    /* --- Statics --- */

    public static async show(actor: CosmereActor) {
        await new ConfigureSkillsDialog(actor).render(true);
    }

    /* --- Lifecycle --- */

    protected _onRender(): void {
        $(this.element).prop('open', true);
    }

    protected _onFirstRender() {
        this.actor.apps[this.id] = this;
    }

    /* --- Context --- */

    protected _prepareContext() {
        return Promise.resolve({
            actor: this.actor,
            attributeGroups: Object.keys(CONFIG.COSMERE.attributeGroups),
            isEditMode: true,
        });
    }
}
