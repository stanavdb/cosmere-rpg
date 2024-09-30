import {
    TalentType,
    Attribute,
    Skill,
    ExpertiseType,
} from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';

import { ExpertiseData } from '../actor/common';

import { MappingField } from '@system/data/fields';

// Mixins
import { DataModelMixin } from '../mixins';
import { IdItemMixin, IdItemData } from './mixins/id';
import { TypedItemMixin, TypedItemData } from './mixins/typed';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';
import {
    ActivatableItemMixin,
    ActivatableItemData,
} from './mixins/activatable';

export const enum TalentPrerequisiteType {
    Talent = 'talent',
    Attribute = 'attribute',
    Skill = 'skill',
    Connection = 'connection',
}

interface BasePrerequisite<Type extends TalentPrerequisiteType> {
    type: Type;
}

interface ConnectionPrerequisite
    extends BasePrerequisite<TalentPrerequisiteType.Connection> {
    description: string;
}

interface AttributePrerequisite
    extends BasePrerequisite<TalentPrerequisiteType.Attribute> {
    attribute: Attribute;
    value: number;
}

interface SkillPrerequisite
    extends BasePrerequisite<TalentPrerequisiteType.Skill> {
    skill: Skill;
    rank: number;
}

interface TalentPrerequisite
    extends BasePrerequisite<TalentPrerequisiteType.Talent> {
    label?: string;
    talent: string;
}

export type Prequisite =
    | ConnectionPrerequisite
    | AttributePrerequisite
    | SkillPrerequisite
    | TalentPrerequisite;

export interface TalentItemData
    extends IdItemData,
        TypedItemData<TalentType>,
        DescriptionItemData,
        ActivatableItemData {
    /**
     * The id of the Path this Talent belongs to.
     */
    path?: string;
    /**
     * Derived value that indicates whether or not the parent
     * Actor has the required path. If no path is defined for this
     * Talent, this value will be undefined.
     */
    hasPath?: boolean;

    /**
     * The id of the Speciality this Talent belongs to.
     */
    specialty?: string;
    /**
     * Derived value that indicates whether or not the parent
     * Actor has the required specialty. If no specialty is defined
     * for this Talent, this value will be undefined.
     */
    hasSpecialty?: boolean;

    /**
     * The id of the Ancestry this Talent belongs to.
     */
    ancestry?: string;
    /**
     * Derived value that indicates whether or not the parent
     * Actor has the required ancestry. If no ancestry is defined
     * for this Talent, this value will be undefined.
     */
    hasAncestry?: boolean;

    prerequisites: Record<string, Prequisite>;
    readonly prerequisitesArray: ({ id: string } & Prequisite)[];
    readonly prerequisiteTypeSelectOptions: Record<
        TalentPrerequisiteType,
        string
    >;

    /**
     * Derived value that indicates whether or not the
     * prerequisites have been met.
     * If no prerequisites are defined for this talent
     * This value will be `true`.
     *
     * NOTE: We have no way of checking connections as
     * they're just plain strings.
     */
    prerequisitesMet: boolean;

    /**
     * Expertises to grant to the Actor upon gaining this
     * Talent. Granted expertises are automatically removed
     * along with its source Talent.
     */
    grantsExpertises?: Omit<ExpertiseData, 'locked'>[];
}

export class TalentItemDataModel extends DataModelMixin<
    TalentItemData,
    CosmereItem
>(
    IdItemMixin(),
    TypedItemMixin({
        initial: TalentType.Path,
        choices: () =>
            Object.entries(CONFIG.COSMERE.talentTypes).reduce(
                (acc, [key, config]) => ({
                    ...acc,
                    [key]: config.label,
                }),
                {} as Record<TalentType, string>,
            ),
    }),
    DescriptionItemMixin(),
    ActivatableItemMixin(),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            path: new foundry.data.fields.StringField({
                required: false,
                nullable: true,
                initial: null,
            }),
            hasPath: new foundry.data.fields.BooleanField(),
            specialty: new foundry.data.fields.StringField({
                required: false,
                nullable: true,
                initial: null,
            }),
            hasSpecialty: new foundry.data.fields.BooleanField(),
            ancestry: new foundry.data.fields.StringField({
                required: false,
                nullable: true,
                initial: null,
            }),
            hasAncestry: new foundry.data.fields.BooleanField(),

            prerequisites: new MappingField(
                new foundry.data.fields.SchemaField(
                    {
                        type: new foundry.data.fields.StringField({
                            required: true,
                            nullable: false,
                            blank: false,
                            choices: {
                                [TalentPrerequisiteType.Talent]:
                                    'COSMERE.Talent.Prerequisite.Type.Talent',
                                [TalentPrerequisiteType.Attribute]:
                                    'COSMERE.Talent.Prerequisite.Type.Attribute',
                                [TalentPrerequisiteType.Skill]:
                                    'COSMERE.Talent.Prerequisite.Type.Skill',
                                [TalentPrerequisiteType.Connection]:
                                    'COSMERE.Talent.Prerequisite.Type.Connection',
                            },
                        }),

                        // Connection
                        description: new foundry.data.fields.StringField(),

                        // Attribute
                        attribute: new foundry.data.fields.StringField({
                            blank: false,
                            choices: Object.entries(
                                CONFIG.COSMERE.attributes,
                            ).reduce(
                                (acc, [key, config]) => ({
                                    ...acc,
                                    [key]: config.label,
                                }),
                                {},
                            ),
                        }),
                        value: new foundry.data.fields.NumberField({
                            min: 0,
                            initial: 0,
                        }),

                        // Skill
                        skill: new foundry.data.fields.StringField({
                            blank: false,
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
                        rank: new foundry.data.fields.NumberField({
                            min: 1,
                            initial: 1,
                        }),

                        // Talent
                        label: new foundry.data.fields.StringField({
                            nullable: true,
                        }),
                        talent: new foundry.data.fields.StringField(),
                    },
                    {
                        nullable: true,
                        validate: (value?: Partial<Prequisite>) => {
                            if (!value) return;

                            switch (value.type) {
                                case TalentPrerequisiteType.Talent:
                                    return (
                                        !!value.talent &&
                                        value.talent.length > 0
                                    );
                                case TalentPrerequisiteType.Attribute:
                                    return (
                                        !!value.attribute &&
                                        value.attribute.length > 0 &&
                                        !!value.value
                                    );
                                case TalentPrerequisiteType.Skill:
                                    return (
                                        !!value.skill &&
                                        value.skill.length > 0 &&
                                        !!value.rank
                                    );
                                case TalentPrerequisiteType.Connection:
                                    return (
                                        !!value.description &&
                                        value.description.length > 0
                                    );
                                default:
                                    return false;
                            }
                        },
                    },
                ),
            ),
            prerequisitesMet: new foundry.data.fields.BooleanField(),

            grantsExpertises: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField({
                    type: new foundry.data.fields.StringField({
                        required: true,
                        nullable: false,
                        blank: false,
                        initial: ExpertiseType.Cultural,
                        choices: Object.keys(CONFIG.COSMERE.expertiseTypes),
                    }),
                    id: new foundry.data.fields.StringField({
                        required: true,
                        nullable: false,
                        blank: false,
                    }),
                    label: new foundry.data.fields.StringField({
                        required: true,
                        nullable: false,
                        blank: false,
                    }),
                    custom: new foundry.data.fields.BooleanField(),
                }),
            ),
        });
    }

    get prerequisitesArray(): ({ id: string } & Prequisite)[] {
        return Object.entries(this.prerequisites).map(([id, prerequisite]) => ({
            id,
            ...prerequisite,
        }));
    }

    get prerequisiteTypeSelectOptions() {
        const choices = (
            (
                this.schema.fields
                    .prerequisites as MappingField<foundry.data.fields.SchemaField>
            ).model.fields.type as foundry.data.fields.StringField
        ).choices as Record<TalentPrerequisiteType, string>;

        return Object.entries(choices).reduce(
            (acc, [key, label]) => ({
                ...acc,
                [key]: label,
            }),
            {} as Record<TalentPrerequisiteType, string>,
        );
    }

    public prepareDerivedData() {
        // Get item
        const item = this.parent;

        // Get actor
        const actor = item.actor;

        if (this.path) {
            this.hasPath =
                actor?.items.some(
                    (item) => item.isPath() && item.id === this.path,
                ) ?? false;
        }

        if (this.specialty) {
            this.hasSpecialty =
                actor?.items.some(
                    (item) => item.isSpecialty() && item.id === this.specialty,
                ) ?? false;
        }

        if (this.ancestry) {
            this.hasAncestry =
                actor?.items.some(
                    (item) => item.isAncestry() && item.id === this.ancestry,
                ) ?? false;
        }

        if (!actor) {
            this.prerequisitesMet = false;
        } else {
            this.prerequisitesMet = this.prerequisitesArray.every(
                (prerequisite) => {
                    switch (prerequisite.type) {
                        case TalentPrerequisiteType.Talent:
                            return actor.items.some(
                                (item) =>
                                    item.isTalent() &&
                                    item.id === prerequisite.id,
                            );
                        case TalentPrerequisiteType.Skill:
                            return (
                                actor.system.skills[prerequisite.skill].rank >=
                                (prerequisite.rank ?? 1)
                            );
                        case TalentPrerequisiteType.Attribute:
                            return (
                                actor.system.attributes[prerequisite.attribute]
                                    .value >= (prerequisite.value ?? 1)
                            );
                        default:
                            return true;
                    }
                },
            );
        }
    }
}
