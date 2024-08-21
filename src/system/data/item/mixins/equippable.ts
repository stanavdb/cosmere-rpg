import { CosmereItem } from '@system/documents';

export interface EquippableItemData {
    equipped: boolean;
    alwaysEquipped?: boolean;
}

export function EquippableItemMixin<P extends CosmereItem>() {
    return (
        base: typeof foundry.abstract.TypeDataModel<EquippableItemData, P>,
    ) => {
        return class mixin extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    equipped: new foundry.data.fields.BooleanField({
                        required: true,
                        nullable: false,
                        initial: false,
                        label: 'Equipped',
                    }),
                    alwaysEquipped: new foundry.data.fields.BooleanField({
                        nullable: true,
                    }),
                });
            }
        };
    };
}
