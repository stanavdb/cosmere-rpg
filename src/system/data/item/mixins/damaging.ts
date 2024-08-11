import { Skill, Attribute, DamageType } from '@system/types/cosmere';

export interface DamagingItemData {
    damage: {
        formula?: string;
        type?: DamageType;
        skill?: Skill;
        attribute?: Attribute;
    };
}

export function DamagingItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class mixin<P extends Document> extends base<P> {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    damage: new foundry.data.fields.SchemaField({
                        formula: new foundry.data.fields.StringField(),
                        type: new foundry.data.fields.StringField({
                            choices: Object.keys(CONFIG.COSMERE.damageTypes)
                        }),
                        skill: new foundry.data.fields.StringField({
                            initial: Skill.LightWeapons, choices: Object.keys(CONFIG.COSMERE.skills)
                        }),
                        attribute: new foundry.data.fields.StringField({
                            initial: Attribute.Speed, choices: Object.keys(CONFIG.COSMERE.attributes)
                        })
                    }),
                });
            }
        }
    }
}