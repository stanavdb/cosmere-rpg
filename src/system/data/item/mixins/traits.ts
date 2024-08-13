import { CosmereItem } from '@system/documents';
import { ExpertiseItemData } from './expertise';

interface TraitData {
    id: string;

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

export interface TraitsItemData {
    traits: Set<TraitData>;
}

/**
 * Mixin for weapon & armor traits
 */
export function TraitsItemMixin<P extends CosmereItem>() {
    return (base: typeof foundry.abstract.TypeDataModel<TraitsItemData, P>) => {
        return class extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    traits: new foundry.data.fields.SetField(
                        new foundry.data.fields.SchemaField({
                            id: new foundry.data.fields.StringField({
                                required: true,
                                nullable: false,
                                blank: false,
                            }),
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

            public prepareDerivedData(): void {
                super.prepareDerivedData();

                const system = this as unknown as TraitsItemData &
                    ExpertiseItemData;

                // Do we have expertise
                const hasExpertise = system.expertise;

                system.traits.forEach((trait) => {
                    if (!hasExpertise) {
                        trait.active = trait.defaultActive;
                        trait.value = trait.defaultValue;
                    } else {
                        if (trait.expertise.toggleActive) {
                            trait.active = !trait.defaultActive;
                        }

                        trait.value =
                            trait.expertise.value ?? trait.defaultValue;
                    }
                });
            }
        };
    };
}
