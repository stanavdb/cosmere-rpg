interface TraitData {
    id: string;
    value?: number;
}

export interface TraitsItemData {
    traits: Set<TraitData>;
    expertTraits: Set<TraitData>;
}

export function TraitsItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    traits: new foundry.data.fields.SetField(
                        new foundry.data.fields.SchemaField({
                            id: new foundry.data.fields.StringField({
                                required: true, nullable: false, blank: false
                            }),
                            value: new foundry.data.fields.NumberField()
                        })
                    ),
                    expertTraits: new foundry.data.fields.SetField(
                        new foundry.data.fields.SchemaField({
                            id: new foundry.data.fields.StringField({
                                required: true, nullable: false, blank: false
                            }),
                            value: new foundry.data.fields.NumberField()
                        })
                    ),
                });
            }
        }
    }
}