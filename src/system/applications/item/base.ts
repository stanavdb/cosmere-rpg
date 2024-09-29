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
    /**
     * NOTE: Unbound methods is the standard for defining actions and forms
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            form: {
                handler: this.onFormEvent,
                submitOnChange: true,
            } as unknown,
        },
    );
    /* eslint-enable @typescript-eslint/unbound-method */

    static TABS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.TABS),
        {
            description: {
                label: 'COSMERE.Item.Sheet.Tabs.Description',
                icon: '<i class="fa-solid fa-feather-pointed"></i>',
            },
            effects: {
                label: 'COSMERE.Item.Sheet.Tabs.Effects',
                icon: '<i class="fa-solid fa-bolt"></i>',
            },
        },
    );

    get item(): CosmereItem {
        return super.document;
    }

    /* --- Form --- */

    protected static onFormEvent(
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

        if (this.item.isPhysical() && 'system.price.unit' in formData.object) {
            // Get currency id
            const [currencyId, denominationId] = (
                formData.object['system.price.unit'] as string
            ).split('.');

            // Remove the unit
            formData.delete('system.price.unit');

            // Get the currency
            const currency = CONFIG.COSMERE.currencies[currencyId];

            formData.set(
                'system.price.currency',
                currency ? currencyId : 'none',
            );

            if (currency) {
                // Get the primary denomination
                const primaryDenomination = currency.denominations.primary.find(
                    (denomination) => denomination.id === denominationId,
                );

                formData.set(
                    'system.price.denomination.primary',
                    primaryDenomination?.id ?? 'none',
                );
            }
        }

        // Update the document
        void this.item.update(formData.object);
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
