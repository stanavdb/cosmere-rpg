export interface IdItemData {
    id: string;
}

export function IdItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    id: new foundry.data.fields.StringField({
                        required: true, nullable: false, blank: false, initial: 'id'
                    })
                });
            }
        }
    }
}