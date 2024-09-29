import { ConnectionItem } from '@system/documents/item';
import { DeepPartial } from '@system/types/utils';

// Base
import { BaseItemSheet } from './base';

export class ConnectionItemSheet extends BaseItemSheet {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            classes: ['cosmere-rpg', 'sheet', 'item', 'connection'],
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

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            'sheet-content': {
                template:
                    'systems/cosmere-rpg/templates/item/connection/parts/sheet-content.hbs',
            },
        },
    );

    get item(): ConnectionItem {
        return super.document;
    }

    /* --- Context --- */

    public async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        if (
            this.item.system.description!.value ===
            CONFIG.COSMERE.items.types.connection.desc_placeholder
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
