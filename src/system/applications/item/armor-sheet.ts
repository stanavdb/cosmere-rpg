import { ArmorTraitId, WeaponTraitId } from '@system/types/cosmere';
import { ArmorItem } from '@system/documents/item';
import { DeepPartial } from '@system/types/utils';

// Base
import { BaseItemSheet } from './base';

export class ArmorItemSheet extends BaseItemSheet {
    /**
     * NOTE: Unbound methods is the standard for defining actions and forms
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            classes: ['cosmere-rpg', 'sheet', 'item', 'armor'],
            position: {
                width: 730,
                height: 500,
            },
            window: {
                resizable: true,
                positioned: true,
            },
            form: {
                handler: this.onFormEvent,
            } as unknown,
        },
    );
    /* eslint-enable @typescript-eslint/unbound-method */

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
                    'systems/cosmere-rpg/templates/item/armor/parts/sheet-content.hbs',
            },
        },
    );

    get item(): ArmorItem {
        return super.document;
    }

    /* --- Form --- */

    protected static onFormEvent(
        this: ArmorItemSheet,
        event: Event,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        const object = formData.object as Record<
            string,
            string | number | boolean
        >;

        const traitsData = Object.entries(object).filter(([key]) =>
            key.startsWith('system.traits'),
        );

        const expertModifyValueTraitsData = traitsData.filter(([key]) =>
            key.endsWith('.expertise.modifyValue'),
        ) as [string, boolean][];

        expertModifyValueTraitsData.forEach(([key, modifiesValue]) => {
            // Get trait id
            const traitId = key
                .replace('system.traits.', '')
                .replace('.expertise.modifyValue', '') as ArmorTraitId;

            // Get the trait
            const trait = this.item.system.traits[traitId];

            if (modifiesValue) {
                if (!trait.expertise?.value) {
                    // Get value
                    const value = trait.defaultValue!;
                    formData.set(
                        `system.traits.${traitId}.expertise.value`,
                        value,
                    );
                    formData.set(
                        `system.traits.${traitId}.expertise.toggleActive`,
                        false,
                    );
                } else if (
                    object[`system.traits.${traitId}.expertise.toggleActive`]
                ) {
                    // Remove value
                    formData.set(
                        `system.traits.${traitId}.expertise.value`,
                        null,
                    );
                }
            } else {
                formData.set(`system.traits.${traitId}.expertise.value`, null);
            }

            // Remove modifyValue
            formData.delete(key);
        });

        super.onFormEvent(event, form, formData);
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
