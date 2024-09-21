import { EquipType, HoldType, EquipHand } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';

export interface EquippableItemData {
    equipped: boolean;
    alwaysEquipped?: boolean;
    equip: {
        type: EquipType;
        hold?: HoldType; // Derived from two handed trait
        hand?: EquipHand;
    };
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
                    equip: new foundry.data.fields.SchemaField({
                        type: new foundry.data.fields.StringField({
                            required: true,
                            nullable: false,
                            initial: EquipType.Wear,
                            choices: Object.keys(
                                CONFIG.COSMERE.items.equip.types,
                            ),
                        }),
                        hold: new foundry.data.fields.StringField({
                            nullable: true,
                            choices: Object.keys(
                                CONFIG.COSMERE.items.equip.hold,
                            ),
                        }),
                        hand: new foundry.data.fields.StringField({
                            nullable: true,
                            choices: Object.keys(
                                CONFIG.COSMERE.items.equip.hand,
                            ),
                        }),
                    }),
                });
            }
        };
    };
}
