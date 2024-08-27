import { CosmereItem } from '@system/documents';

export interface PhysicalItemData {
    quantity: number;
    weight: {
        value?: number;
        unit?: string;
    };
    price: {
        value?: number;
        unit?: string;
    };
}

export function PhysicalItemMixin<P extends CosmereItem>() {
    return (
        base: typeof foundry.abstract.TypeDataModel<PhysicalItemData, P>,
    ) => {
        return class extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    quantity: new foundry.data.fields.NumberField({
                        min: 0,
                        initial: 1,
                        integer: true,
                    }),
                    weight: new foundry.data.fields.SchemaField({
                        value: new foundry.data.fields.NumberField({
                            min: 0,
                        }),
                        unit: new foundry.data.fields.StringField(),
                    }),
                    price: new foundry.data.fields.SchemaField({
                        value: new foundry.data.fields.NumberField({
                            min: 0,
                        }),
                        unit: new foundry.data.fields.StringField(),
                    }),
                });
            }
        };
    };
}
