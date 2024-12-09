// Types
import { Resource } from '@system/types/cosmere';
import { DeepPartial, AnyObject } from '@system/types/utils';

import { CommonActorDataModel, CommonActorData } from './common';

// Utils
import * as Advancement from '@system/utils/advancement';

// Fields
import { DerivedValueField, Derived, MappingField } from '../fields';

interface GoalData {
    text: string;
    level: number;
}

interface ConnectionData {
    name: string;
    description: string;
}

export interface CharacterActorData extends CommonActorData {
    /* --- Advancement --- */
    level: number;

    /**
     * Derived value for the maximum rank a skill can be.
     * Based on the character's tier.
     */
    maxSkillRank: number;

    /**
     * The number of skill points the character has available to spend.
     */
    availableSkillPoints: number;

    /**
     * The number of attribute points the character has available to spend.
     */
    availableAttributePoints: number;

    /**
     * The number of talents the character has available to pick.
     */
    availableTalents: number;

    /* --- Derived statistics --- */
    recovery: { die: Derived<string> };

    /* --- Goals, Connections, Purpose, and Obstacle --- */
    purpose: string;
    obstacle: string;
    goals?: GoalData[];
    connections: ConnectionData[];
}

export class CharacterActorDataModel extends CommonActorDataModel<CharacterActorData> {
    public static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            /* --- Advancement --- */
            level: new foundry.data.fields.NumberField({
                required: true,
                nullable: false,
                integer: true,
                min: 1,
                initial: 1,
                label: 'COSMERE.Actor.Level.Label',
            }),

            maxSkillRank: new foundry.data.fields.NumberField({
                required: true,
                nullable: false,
                integer: true,
                initial: 2,
                max: 5,
            }),

            availableSkillPoints: new foundry.data.fields.NumberField({
                required: true,
                nullable: false,
                integer: true,
                initial: 0,
                min: 0,
            }),

            availableAttributePoints: new foundry.data.fields.NumberField({
                required: true,
                nullable: false,
                integer: true,
                initial: 0,
                min: 0,
            }),

            availableTalents: new foundry.data.fields.NumberField({
                required: true,
                nullable: false,
                integer: true,
                initial: 0,
                min: 0,
            }),

            /* --- Derived statistics --- */

            recovery: new foundry.data.fields.SchemaField({
                die: new DerivedValueField(
                    new foundry.data.fields.StringField({
                        required: true,
                        blank: false,
                        initial: 'd4',
                        choices: RECOVERY_DICE,
                    }),
                ),
            }),

            /* --- Goals, Connections, Purpose, and Obstacle --- */
            goals: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField({
                    text: new foundry.data.fields.StringField({
                        required: true,
                    }),
                    level: new foundry.data.fields.NumberField({
                        required: true,
                        integer: true,
                        initial: 0,
                        min: 0,
                        max: 3,
                    }),
                }),
                {
                    required: true,
                    nullable: true,
                    initial: null,
                },
            ),
            connections: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField({
                    name: new foundry.data.fields.StringField({
                        required: true,
                    }),
                    description: new foundry.data.fields.HTMLField({
                        required: true,
                    }),
                }),
                {
                    required: true,
                    nullable: false,
                    initial: [],
                },
            ),
            purpose: new foundry.data.fields.HTMLField({
                required: true,
                initial: '',
            }),
            obstacle: new foundry.data.fields.HTMLField({
                required: true,
                initial: '',
            }),
        });
    }

    public static migrateData(source: object): object {
        const data = super.migrateData(source);

        if ('level' in data && typeof data.level === 'object') {
            data.level = (data.level as { total: number }).total;
        }

        return data;
    }

    public prepareDerivedData() {
        super.prepareDerivedData();

        // Get advancement rules relevant to the character
        const advancementRules = Advancement.getAdvancementRulesUpToLevel(
            this.level,
        );

        // Calculate the tier based on the character's level
        this.tier = Math.min(Math.ceil(this.level / 5), 5);

        // Calculate the maximum skill rank based on the tier
        this.maxSkillRank = Math.min(this.tier + 1, 5);

        // Derive the recovery die based on the character's willpower
        this.recovery.die.value = willpowerToRecoveryDie(
            this.attributes.wil.value,
        );

        // Derive resource max
        (Object.keys(this.resources) as Resource[]).forEach((key) => {
            // Get the resource
            const resource = this.resources[key];

            if (key === Resource.Health) {
                // Get strength mod
                const strength =
                    this.attributes.str.value + this.attributes.str.bonus;

                // Assign max
                resource.max.value =
                    Advancement.deriveMaxHealth(advancementRules, strength) +
                    (resource.max.bonus ?? 0);
            } else if (key === Resource.Focus) {
                // Get willpower mod
                const willpower =
                    this.attributes.wil.value + this.attributes.wil.bonus;

                // Assign max
                resource.max.value = 2 + willpower + (resource.max.bonus ?? 0);
            }

            // Get max
            const max = Derived.getValue(resource.max)!;

            // Ensure resource value is between max mand min
            resource.value = Math.max(0, Math.min(max, resource.value));
        });
    }

    protected override async _preUpdate(
        changes: { system?: DeepPartial<CharacterActorData> },
        options: AnyObject,
        user: foundry.documents.BaseUser,
    ) {
        // Check if the level has changed
        if (changes.system?.level && changes.system.level !== this.level) {
            // Get the level difference
            const diff = changes.system.level - this.level;

            // Get the rules to apply between the current and new level
            const rules = Advancement.getAdvancementRulesForLevelChange(
                this.level,
                changes.system.level,
            );

            // Check if the character is gaining a level
            const isGainingLevels = diff > 0;

            // Assign the current values to the changes to serve as a base
            changes.system.availableSkillPoints = this.availableSkillPoints;
            changes.system.availableAttributePoints =
                this.availableAttributePoints;
            changes.system.availableTalents = this.availableTalents;

            if (isGainingLevels) {
                // Apply the rules to the changes
                rules.forEach((rule) => {
                    if (rule.skillRanks && rule.skillRanks > 0) {
                        changes.system!.availableSkillPoints! +=
                            rule.skillRanks;
                    }

                    if (rule.attributePoints && rule.attributePoints > 0) {
                        changes.system!.availableAttributePoints! +=
                            rule.attributePoints;
                    }

                    if (rule.talents && rule.talents > 0) {
                        changes.system!.availableTalents! += rule.talents;
                    }
                });
            } else {
                // Apply the rules to the changes
                rules.forEach((rule) => {
                    if (rule.skillRanks && rule.skillRanks > 0) {
                        changes.system!.availableSkillPoints! -=
                            rule.skillRanks;
                    }

                    if (rule.attributePoints && rule.attributePoints > 0) {
                        changes.system!.availableAttributePoints! -=
                            rule.attributePoints;
                    }

                    if (rule.talents && rule.talents > 0) {
                        changes.system!.availableTalents! -= rule.talents;
                    }
                });
            }
        }

        await super._preUpdate(changes, options, user);
    }
}

export const RECOVERY_DICE = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
function willpowerToRecoveryDie(willpower: number) {
    return RECOVERY_DICE[
        Math.min(Math.ceil(willpower / 2), RECOVERY_DICE.length)
    ];
}
