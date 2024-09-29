import { SpecialtyItem } from '@system/documents/item';
import { DeepPartial } from '@system/types/utils';

// Base
import { BaseItemSheet } from './base';

export class SpecialtyItemSheet extends BaseItemSheet {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            classes: ['cosmere-rpg', 'sheet', 'item', 'specialty'],
            position: {
                width: 550,
                height: 500,
            },
            window: {
                resizable: true,
                positioned: true,
            },
        },
    );

    static TABS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.TABS),
        {
            details: {
                label: 'COSMERE.Item.Sheet.Tabs.Details',
                icon: '<i class="fa-solid fa-circle-info"></i>',
                sortIndex: 15,
            },
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            'sheet-content': {
                template:
                    'systems/cosmere-rpg/templates/item/specialty/parts/sheet-content.hbs',
            },
        },
    );

    get item(): SpecialtyItem {
        return super.document;
    }

    /* --- Context --- */

    public async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        if (
            this.item.system.description!.value ===
            CONFIG.COSMERE.items.types.specialty.desc_placeholder
        ) {
            this.item.system.description!.value = game.i18n!.localize(
                this.item.system.description!.value!,
            );
        }
        const enrichedDescValue = await TextEditor.enrichHTML(
            this.item.system.description!.value!,
        );

        return {
            ...(await super._prepareContext(options)),
            descHtml: enrichedDescValue,
        };
    }
}
