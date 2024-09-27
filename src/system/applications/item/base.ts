import { CosmereItem } from '@system/documents/item';
import { DeepPartial, AnyObject } from '@system/types/utils';

// Mixins
import { ComponentHandlebarsApplicationMixin } from '@system/applications/component-system';
import { TabsApplicationMixin } from '@system/applications/mixins';

const { ItemSheetV2 } = foundry.applications.sheets;

export interface BaseItemSheetRenderContext {
    item: CosmereItem;
}

export class BaseItemSheet extends TabsApplicationMixin(
    ComponentHandlebarsApplicationMixin(ItemSheetV2),
)<AnyObject> {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {},
    );

    static TABS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.TABS),
        {
            description: {
                label: 'COSMERE.Item.Sheet.Tabs.Description',
            },
            effects: {
                label: 'COSMERE.Item.Sheet.Tabs.Effects',
            },
        },
    );

    get item(): CosmereItem {
        return super.document;
    }

    /* --- Context --- */

    public async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        return {
            ...(await super._prepareContext(options)),
            item: this.item,
            editable: this.isEditable,
        };
    }
}
