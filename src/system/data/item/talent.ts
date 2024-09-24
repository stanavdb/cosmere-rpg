import { Attribute, Skill, ExpertiseType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';

import { ExpertiseData } from '../actor/common';

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

interface ConnectionPrerequisite {
    description: string;
}

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

    prerequisites: {
        talents: TalentPrerequisite[];
        attributes: AttributePrerequisite[];
        skills: SkillPrerequisite[];
        connections: ConnectionPrerequisite[];
    };

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
>(IdItemMixin(), DescriptionItemMixin(), ActivatableItemMixin()) {
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
            this.prerequisitesMet =
                this.prerequisites.talents.every((prerequisite) =>
                    actor.items.some(
                        (item) =>
                            item.isTalent() &&
                            item.id === prerequisite.talentId,
                    ),
                ) &&
                this.prerequisites.skills.every(
                    (prerequisite) =>
                        actor.system.skills[prerequisite.skill].rank >=
                        (prerequisite.rank ?? 1),
                ) &&
                this.prerequisites.attributes.every(
                    (prerequisite) =>
                        actor.system.attributes[prerequisite.attribute].value >=
                        (prerequisite.value ?? 1),
                );
        }
    }
}
