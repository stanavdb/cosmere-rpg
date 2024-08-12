import { CosmereItem } from '@system/documents';

export interface TypedItemData<T extends string = string> {
    type: T;
}

export function TypedItemMixin<P extends CosmereItem>() {
    return (base: typeof foundry.abstract.TypeDataModel<TypedItemData, P>) => {
        return class extends base {
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