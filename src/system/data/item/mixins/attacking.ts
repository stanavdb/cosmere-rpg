import { AttackType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';

export interface AttackingItemData {
    attack: {
        type: AttackType;
        range?: {
            value?: number;
            long?: number;
            unit?: string;
        };
    };
}

export function AttackingItemMixin<P extends CosmereItem>() {
    return (
        base: typeof foundry.abstract.TypeDataModel<AttackingItemData, P>,
    ) => {
        return class extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    attack: new foundry.data.fields.SchemaField({
                        type: new foundry.data.fields.StringField({
                            required: true,
                            nullable: false,
                            initial: AttackType.Melee,
                            choices: Object.entries(
                                CONFIG.COSMERE.attack.types,
                            ).reduce(
                                (acc, [key, config]) => ({
                                    ...acc,
                                    [key]: config.label,
                                }),
                                {} as Record<AttackType, string>,
                            ),
                        }),
                        range: new foundry.data.fields.SchemaField(
                            {
                                value: new foundry.data.fields.NumberField({
                                    min: 0,
                                }),
                                long: new foundry.data.fields.NumberField({
                                    min: 0,
                                }),
                                unit: new foundry.data.fields.StringField(),
                            },
                            { required: false, nullable: true },
                        ),
                    }),
                });
            }
        };
    };
}
