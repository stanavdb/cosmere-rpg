import { Skill, ActionCostType } from '@system/types/cosmere';

export interface ActivatableItemData {
    activation: {
        cost: {
            value?: number;
            type?: ActionCostType;
        };
    }
}

export function ActivatableItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class mixin<P extends Document> extends base<P> {
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