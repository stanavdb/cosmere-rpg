import { AdversaryActor } from '@system/documents';

// Components
import {
    AdversaryHeaderComponent,
    AdversarySkillsGroupComponent,
} from './components/adversary';

// Dialogs
import { ConfigureSkillsDialog } from './dialogs/configure-skills';

// Base
import { BaseActorSheet, BaseActorSheetRenderContext } from './base';

export type AdversarySheetRenderContext = Omit<
    BaseActorSheetRenderContext,
    'actor'
> & {
    actor: AdversaryActor;
};

export class AdversarySheet extends BaseActorSheet<AdversarySheetRenderContext> {
    /**
     * NOTE: Unbound methods is the standard for defining actions and forms
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            classes: ['cosmere-rpg', 'sheet', 'actor', 'adversary'],
            position: {
                width: 850,
                height: 850,
            },
            dragDrop: [
                {
                    dropSelector: '*',
                },
            ],
            actions: {
                'toggle-skills-collapsed': this.onToggleSkillsCollapsed,
                'configure-skills': this.onConfigureSkills,
            },
        },
    );
    /* eslint-enable @typescript-eslint/unbound-method */

    static COMPONENTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.COMPONENTS),
        {
            'app-adversary-header': AdversaryHeaderComponent,
            'app-adversary-skills-group': AdversarySkillsGroupComponent,
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            'sheet-content': {
                template:
                    'systems/cosmere-rpg/templates/actors/adversary/parts/sheet-content.hbs',
            },
        },
    );

    get actor(): AdversaryActor {
        return super.document;
    }

    get areSkillsCollapsed(): boolean {
        return (
            this.actor.getFlag('cosmere-rpg', 'sheet.skillsCollapsed') ?? false
        );
    }

    /* --- Actions --- */

    private static onToggleSkillsCollapsed(this: AdversarySheet) {
        // Update the flag
        void this.actor.setFlag(
            'cosmere-rpg',
            'sheet.skillsCollapsed',
            !this.areSkillsCollapsed,
        );
    }

    private static onConfigureSkills(this: AdversarySheet) {
        void ConfigureSkillsDialog.show(this.actor);
    }

    /* --- Context --- */

    public async _prepareContext(
        options: Partial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        return {
            ...(await super._prepareContext(options)),

            skillsCollapsed: this.areSkillsCollapsed,
        };
    }
}
