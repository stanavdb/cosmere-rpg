import { ActionCostType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';

export interface ActivatableItemData {
    activation: {
        cost: {
            value?: number;
            type?: ActionCostType;
        };
    }
}

export function ActivatableItemMixin<P extends CosmereItem>() {
    return (base: typeof foundry.abstract.TypeDataModel<ActivatableItemData, P>) => {
        return class mixin extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    activation: new foundry.data.fields.SchemaField({
                        cost: new foundry.data.fields.SchemaField({
                            value: new foundry.data.fields.NumberField(),
                            type: new foundry.data.fields.StringField({
                                choices: Object.keys(CONFIG.COSMERE.actionCosts)
                            })
                        }),
                    })
                });
            }
        }
    }
}