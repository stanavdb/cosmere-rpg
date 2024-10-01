import { InjuryType } from '@system/types/cosmere';
import { InjuryItem } from '@system/documents/item';
import { DeepPartial } from '@system/types/utils';

// Base
import { BaseItemSheet } from './base';

export class InjuryItemSheet extends BaseItemSheet {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            classes: ['cosmere-rpg', 'sheet', 'item', 'injury'],
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
                sortIndex: 15,
            },
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            'sheet-content': {
                template:
                    'systems/cosmere-rpg/templates/item/injury/parts/sheet-content.hbs',
            },
        },
    );

    get item(): InjuryItem {
        return super.document;
    }

    /* --- Context --- */

    public async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        return {
            ...(await super._prepareContext(options)),
            isPermanent:
                this.item.system.type === InjuryType.PermanentInjury ||
                this.item.system.type === InjuryType.Death,
        };
    }
}
