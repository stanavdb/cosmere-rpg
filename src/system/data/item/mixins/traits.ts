import { WeaponTraitId, ArmorTraitId } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';
import { ExpertiseItemData } from './expertise';

import { MappingField } from '@system/data/fields';

interface TraitData {
    /**
     * The default (not expertise) value of this trait
     */
    defaultValue?: number;

    /**
     * The current value of this trait.
     * This is a derived value
     */
    value?: number;

    /**
     * Whether or not this trait is active by default (not expertise)
     */
    defaultActive: boolean;

    /**
     * Whether or not this trait is currently active.
     * This is a derived value
     */
    active: boolean;

    /**
     * How is this trait modified when the actor has expertise with the item?
     */
    expertise: {
        /**
         * Toggle whether or not the trait is active.
         * If it is active by default, it becomes inactive and vice versa.
         */
        toggleActive?: boolean;

        /**
         * Change the value of this trait to this value.
         */
        value?: number;
    };
}

export interface TraitsItemData<
    TraitId extends WeaponTraitId | ArmorTraitId = WeaponTraitId | ArmorTraitId,
> {
    traits: Record<TraitId, TraitData>;
    readonly traitsArray: ({ id: TraitId } & TraitData)[];
}

/**
 * Mixin for weapon & armor traits
 */
export function TraitsItemMixin<
    P extends CosmereItem,
    TraitId extends WeaponTraitId | ArmorTraitId = WeaponTraitId | ArmorTraitId,
>() {
    return (
        base: typeof foundry.abstract.TypeDataModel<
            TraitsItemData<TraitId> & ExpertiseItemData,
            P
        >,
    ) => {
        return class extends base {
            static defineSchema() {
                const superSchema = super.defineSchema();

                if (!('expertise' in superSchema)) {
                    throw new Error(
                        'TraitsItemMixin must be used in combination with ExpertiseItemMixin and must follow it',
                    );
                }

                return foundry.utils.mergeObject(super.defineSchema(), {
                    traits: new MappingField(
                        new foundry.data.fields.SchemaField({
                            defaultValue: new foundry.data.fields.NumberField({
                                integer: true,
                            }),
                            value: new foundry.data.fields.NumberField({
                                integer: true,
                            }),
                            defaultActive: new foundry.data.fields.BooleanField(
                                {
                                    required: true,
                                    nullable: false,
                                    initial: true,
                                },
                            ),
                            active: new foundry.data.fields.BooleanField({
                                required: true,
                                nullable: false,
                                initial: true,
                            }),
                            expertise: new foundry.data.fields.SchemaField({
                                toggleActive:
                                    new foundry.data.fields.BooleanField(),
                                value: new foundry.data.fields.NumberField({
                                    integer: true,
                                }),
                            }),
                        }),
                    ),
                });
            }

            get traitsArray(): ({ id: TraitId } & TraitData)[] {
                return (Object.entries(this.traits) as [TraitId, TraitData][])
                    .map(([id, trait]) => ({ id, ...trait }))
                    .sort((a, b) => a.id.localeCompare(b.id));
            }

            public prepareDerivedData(): void {
                super.prepareDerivedData();

                // Do we have expertise
                const hasExpertise = this.expertise;

                Object.values<TraitData>(this.traits).forEach((trait) => {
                    if (!hasExpertise) {
                        trait.active = trait.defaultActive;
                        trait.value = trait.defaultValue;
                    } else {
                        trait.active = trait.expertise.toggleActive
                            ? !trait.defaultActive
                            : trait.defaultActive;

                        trait.value =
                            trait.expertise.value ?? trait.defaultValue;
                    }
                });
            }
        };
    };
}
