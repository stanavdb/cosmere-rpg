export interface TypedItemData<T extends string = string> {
    type: T;
}

export function TypedItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class mixin<P extends Document> extends base<P> {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    type: new foundry.data.fields.StringField({
                        required: true, nullable: false, initial: 'unknown', label: 'Type'
                    })
                })
            }
        };
    }
}