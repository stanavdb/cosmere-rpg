export interface EquippableItemData {
    equipped: boolean;
}

export function EquippableItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class mixin<P extends Document> extends base<P> {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    equipped: new foundry.data.fields.BooleanField({
                        required: true, nullable: false, initial: false, label: 'Equipped'
                    })
                });
            }
        }
    }
}