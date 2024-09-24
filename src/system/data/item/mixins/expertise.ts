import { CosmereItem } from '@system/documents/item';
import { IdItemData } from './id';

export interface ExpertiseItemData {
    expertise: boolean;
}

export function ExpertiseItemMixin<P extends CosmereItem>() {
    return (
        base: typeof foundry.abstract.TypeDataModel<
            ExpertiseItemData & IdItemData,
            P
        >,
    ) => {
        return class extends base {
            static defineSchema() {
                const superSchema = super.defineSchema();

                // Ensure schema contains id (id mixin was used)
                if (!('id' in superSchema)) {
                    throw new Error(
                        'ExpertiseItemMixin must be used in combination with IdItemMixin',
                    );
                }

                return foundry.utils.mergeObject(super.defineSchema(), {
                    expertise: new foundry.data.fields.BooleanField({
                        required: true,
                        nullable: false,
                        initial: false,
                        label: 'Expertise',
                    }),
                });
            }

            public prepareDerivedData(): void {
                super.prepareDerivedData();

                const parent = this.parent;

                // Check if item type can be found in expertise types
                const isKnownExpertiseType =
                    parent.type in CONFIG.COSMERE.expertiseTypes;

                if (isKnownExpertiseType && !!parent.actor) {
                    // Check if the actor has the expertise
                    const actorHasExpertise =
                        parent.actor.system.expertises?.some(
                            (expertise) => expertise.id === this.id,
                        );

                    // If the actor has the expertise, enable it
                    if (actorHasExpertise) {
                        this.expertise = true;
                    }
                }
            }
        };
    };
}
