import { Skill } from '@system/types/cosmere';

export interface ActivatableItemData {
    activation: {
        cost: {
            value?: number;
            type?: string;
        };
        type?: string;
        skill?: Skill;
        damage: {
            formula?: string;
            type?: string;
        };
    }
}

export function ActivatableItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    activation: new foundry.data.fields.SchemaField({
                        cost: new foundry.data.fields.SchemaField({
                            value: new foundry.data.fields.NumberField(),
                            type: new foundry.data.fields.StringField()
                        }),
                        skill: new foundry.data.fields.StringField({
                            initial: Skill.LightWeapons,
                        }),
                        damage: new foundry.data.fields.SchemaField({
                            formula: new foundry.data.fields.StringField(),
                            type: new foundry.data.fields.StringField()
                        }),
                    })
                });
            }
        }
    }
}