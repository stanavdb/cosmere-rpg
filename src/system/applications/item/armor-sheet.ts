import { ArmorItem } from '@system/documents/item';
import { DeepPartial } from '@system/types/utils';
import { SYSTEM_ID } from '@src/system/constants';

// Base
import { BaseItemSheet } from './base';

export class ArmorItemSheet extends BaseItemSheet {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            classes: [SYSTEM_ID, 'sheet', 'item', 'armor'],
            position: {
                width: 730,
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
                    'systems/cosmere-rpg/templates/item/armor/parts/sheet-content.hbs',
            },
        },
    );

    get item(): ArmorItem {
        return super.document;
    }

    /* --- Context --- */

    public async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        return {
            ...(await super._prepareContext(options)),
        };
    }
}
