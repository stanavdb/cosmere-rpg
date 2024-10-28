import { Goal } from '@system/types/item';
import { CosmereItem } from '@system/documents';

import { CollectionField } from '@system/data/fields';

// Mixins
import { DataModelMixin } from '../mixins';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';

export interface GoalItemData extends DescriptionItemData {
    /**
     * The progress level of the goal
     */
    level: number;

    /**
     * Changes to the character when the goal is completed
     */
    onCompletion: {
        /**
         * Grants that are given to the character when the goal is completed
         */
        grants: Collection<Goal.GrantRule>;
    };
}

export class GoalItemDataModel extends DataModelMixin<
    GoalItemData,
    CosmereItem
>(
    DescriptionItemMixin({
        value: 'COSMERE.Item.Type.Goal.desc_placeholder',
    }),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            level: new foundry.data.fields.NumberField({
                required: true,
                nullable: false,
                integer: true,
                min: 0,
                max: 3,
                initial: 0,
                label: 'COSMERE.Item.Goal.Level.Label',
            }),

            onCompletion: new foundry.data.fields.SchemaField({
                grants: new CollectionField(
                    new foundry.data.fields.SchemaField(
                        {
                            type: new foundry.data.fields.StringField({
                                required: true,
                                nullable: false,
                                initial: Goal.GrantType.SkillRanks,
                                label: 'COSMERE.Item.Goal.GrantRule.Type.Label',
                                choices: [
                                    Goal.GrantType.SkillRanks,
                                    Goal.GrantType.Power,
                                ].reduce(
                                    (acc, type) => ({
                                        ...acc,
                                        [type]: `COSMERE.Item.Goal.GrantType.${type}`,
                                    }),
                                    {},
                                ),
                            }),
                            skill: new foundry.data.fields.StringField({
                                required: false,
                                nullable: true,
                                blank: false,
                                initial: null,
                                label: 'COSMERE.Item.Goal.GrantRule.Skill.Label',
                                choices: Object.entries(
                                    CONFIG.COSMERE.skills,
                                ).reduce(
                                    (acc, [key, config]) => ({
                                        ...acc,
                                        [key]: config.label,
                                    }),
                                    {},
                                ),
                            }),
                            ranks: new foundry.data.fields.NumberField({
                                required: false,
                                nullable: true,
                                initial: 0,
                                integer: true,
                                min: 0,
                                label: 'COSMERE.Item.Goal.GrantRule.Ranks.Label',
                            }),
                            power: new foundry.data.fields.DocumentUUIDField({
                                required: false,
                                nullable: true,
                                initial: null,
                                label: 'COSMERE.Item.Goal.GrantRule.Power.Label',
                            }),
                        },
                        {
                            validate: (value: Goal.GrantRule) => {
                                if (value.type === Goal.GrantType.SkillRanks) {
                                    if (!('skill' in value))
                                        throw new Error(
                                            'Field "skill" is required for grant rule type "skill-ranks"',
                                        );
                                    if (!('ranks' in value))
                                        throw new Error(
                                            'Field "ranks" is required for grant rule type "skill-ranks"',
                                        );
                                } else if (
                                    value.type === Goal.GrantType.Power
                                ) {
                                    if (!('power' in value))
                                        throw new Error(
                                            'Field "power" is required for grant rule type "power"',
                                        );
                                }
                            },
                        },
                    ),
                ),
            }),
        });
    }
}
