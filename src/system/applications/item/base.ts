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
                icon: '<i class="fa-solid fa-feather-pointed"></i>',
            },
            effects: {
                label: 'COSMERE.Item.Sheet.Tabs.Effects',
                icon: '<i class="fa-solid fa-gear"></i>',
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

    /* --- Form --- */

    public static onFormEvent(
        this: BaseItemSheet,
        event: Event,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        if (
            !(event.target instanceof HTMLInputElement) &&
            !(event.target instanceof HTMLTextAreaElement) &&
            !(
                event.target instanceof
                foundry.applications.elements.HTMLProseMirrorElement
            )
        )
            return;
        if (!event.target.name) return;

        console.dir(formData);

        // Update document
        void this.item.update(formData.object, { diff: false });
    }
}
