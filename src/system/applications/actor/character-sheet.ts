import './components';

import { ItemType } from '@system/types/cosmere';
import { CharacterActor } from '@system/documents';

// Character builder
import { CharacterBuilder } from '@system/applications/character-builder';

// Base
import { BaseActorSheet } from './base';

// Constants
import { SYSTEM_ID } from '@src/system/constants';

const enum CharacterSheetTab {
    Details = 'details',
    Goals = 'goals',
}

export class CharacterSheet extends BaseActorSheet {
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            classes: [SYSTEM_ID, 'sheet', 'actor', 'character'],
            position: {
                width: 850,
                height: 1000,
            },
            actions: {
                'show-character-builder': this._onShowCharacterBuilder,
            },
        },
    );
    /* eslint-enable @typescript-eslint/unbound-method */

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            header: {
                template:
                    'systems/cosmere-rpg/templates/actors/character/parts/header.hbs',
            },
            'sheet-content': {
                template:
                    'systems/cosmere-rpg/templates/actors/character/parts/sheet-content.hbs',
            },
        },
    );

    static TABS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.TABS),
        {
            [CharacterSheetTab.Details]: {
                label: 'COSMERE.Actor.Sheet.Tabs.Details',
                icon: '<i class="fa-solid fa-feather-pointed"></i>',
                sortIndex: 0,
            },

            [CharacterSheetTab.Goals]: {
                label: 'COSMERE.Actor.Sheet.Tabs.Goals',
                icon: '<i class="fa-solid fa-list"></i>',
                sortIndex: 25,
            },
        },
    );

    get actor(): CharacterActor {
        return super.document;
    }

    /* --- Actions --- */

    private static _onShowCharacterBuilder(this: CharacterSheet) {
        void CharacterBuilder.show(this.actor);
    }

    /* --- Lifecycle --- */

    protected _getHeaderControls(): foundry.applications.api.ApplicationV2.HeaderControlsEntry[] {
        const controls = super._getHeaderControls();

        if (
            !controls.some(
                (control) => control.action === 'show-character-builder',
            )
        ) {
            controls.push({
                action: 'show-character-builder',
                label: 'Show Character Builder',
                icon: 'fa-solid fa-trowel-bricks',
            });
        }

        return controls;
    }

    /* --- Context --- */

    public async _prepareContext(
        options: Partial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        // Find the ancestry
        const ancestryItem = this.actor.items.find(
            (item) => item.type === ItemType.Ancestry,
        );

        // Find all paths
        const pathItems = this.actor.items.filter((item) => item.isPath());

        // Split paths by type
        const pathTypes = pathItems
            .map((item) => item.system.type)
            .filter((v, i, self) => self.indexOf(v) === i); // Filter out duplicates

        return {
            ...(await super._prepareContext(options)),

            pathTypes: pathTypes.map((type) => ({
                type,
                typeLabel: CONFIG.COSMERE.path.types[type].label,
                paths: pathItems.filter((i) => i.system.type === type),
            })),

            ancestryLabel:
                ancestryItem?.name ??
                game.i18n?.localize('COSMERE.Item.Type.Ancestry.label'),
        };
    }
}
