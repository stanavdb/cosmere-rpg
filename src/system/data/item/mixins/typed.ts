export interface TypedItemData {
    type: string;
}

export function TypedItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    type: new foundry.data.fields.StringField({
                        required: true, nullable: false, initial: 'unknown', label: 'Type'
                    })
                })
            }
        }
    }
}