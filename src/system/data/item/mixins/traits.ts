export interface TraitsItemData {
    traits: Set<string>;
    expertTraits: Set<string>;
}

export function TraitsItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    traits: new foundry.data.fields.SetField(new foundry.data.fields.StringField()),
                    expertTraits: new foundry.data.fields.SetField(new foundry.data.fields.StringField()),
                });
            }
        }
    }
}