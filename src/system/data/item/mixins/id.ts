import { CosmereItem } from '@system/documents';

export interface IdItemData {
    id: string;
}

export function IdItemMixin<P extends CosmereItem>() {
    return (base: typeof foundry.abstract.TypeDataModel<IdItemData, P>) => {
        return class extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    id: new foundry.data.fields.StringField({
                        required: true,
                        nullable: false,
                        blank: false,
                        initial: 'id',
                    }),
                });
            }
        };
    };
}
