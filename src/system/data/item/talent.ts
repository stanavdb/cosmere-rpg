import { Attribute, Skill } from '@system/types/cosmere';

// Mixins
import { DataModelMixin } from '../mixins';
import { IdItemMixin, IdItemData } from './mixins/id';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';
import {
    ActivatableItemMixin,
    ActivatableItemData,
} from './mixins/activatable';

interface AttributePrerequisite {
    attribute: Attribute;
    value?: number;
}

interface SkillPrerequisite {
    skill: Skill;
    rank?: number;
}

interface TalentPrerequisite {
    talentId: string;
}

export interface TalentItemData
    extends IdItemData,
        DescriptionItemData,
        ActivatableItemData {
    prerequisites: {
        attributes: AttributePrerequisite[];
        skills: SkillPrerequisite[];
        talents: TalentPrerequisite[];
    };
}

export class TalentItemDataModel extends DataModelMixin(
    IdItemMixin(),
    DescriptionItemMixin(),
    ActivatableItemMixin(),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            prerequisites: new foundry.data.fields.SchemaField({
                attributes: new foundry.data.fields.ArrayField(
                    new foundry.data.fields.SchemaField({
                        attribute: new foundry.data.fields.StringField({
                            required: true,
                            nullable: false,
                            blank: false,
                            initial: Attribute.Strength,
                        }),
                        value: new foundry.data.fields.NumberField({
                            min: 0,
                            initial: 0,
                        }),
                    }),
                ),
                skills: new foundry.data.fields.ArrayField(
                    new foundry.data.fields.SchemaField({
                        skill: new foundry.data.fields.StringField({
                            required: true,
                            nullable: false,
                            blank: false,
                            initial: Skill.Agility,
                        }),
                        rank: new foundry.data.fields.NumberField({
                            min: 0,
                            initial: 0,
                        }),
                    }),
                ),
                talents: new foundry.data.fields.ArrayField(
                    new foundry.data.fields.SchemaField({
                        talentId: new foundry.data.fields.StringField({
                            required: true,
                            nullable: false,
                        }),
                    }),
                ),
            }),
        });
    }
}
