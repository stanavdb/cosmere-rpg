export interface PhysicalItemData {
    weight?: {
        value?: number;
        unit?: string;
    },
    price?: {
        value?: number;
        unit?: string;
    }
}

export function PhysicalItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    weight: new foundry.data.fields.SchemaField({
                        value: new foundry.data.fields.NumberField({
                            min: 0, initial: 0
                        }),
                        unit: new foundry.data.fields.StringField()
                    }),
                    price: new foundry.data.fields.SchemaField({
                        value: new foundry.data.fields.NumberField({
                            min: 0, initial: 0
                        }),
                        unit: new foundry.data.fields.StringField()
                    }),
                });
            }
        }
    }
}