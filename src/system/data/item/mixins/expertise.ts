import { CosmereItem } from '@system/documents/item';
import { TypedItemData } from './typed';

export interface ExpertiseItemData {
    expertise: boolean;
}

export function ExpertiseItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class mixin<P extends Document> extends base<P> {
            static defineSchema() {
                const superSchema = super.defineSchema();

                // Ensure schema contains id (id mixin was used)
                if (!('type' in superSchema)) {
                    throw new Error('ExpertiseItemMixin must be used in combination with TypedItemMixin');
                }

                return foundry.utils.mergeObject(super.defineSchema(), {
                    expertise: new foundry.data.fields.BooleanField({
                        required: true, nullable: false, initial: false, label: 'Expertise'
                    })
                });
            }

            public prepareDerivedData(): void {
                super.prepareDerivedData();
                
                const system = this as any as ExpertiseItemData & TypedItemData;
                const parent = this.parent as any as CosmereItem;

                // Check if item type can be found in expertise types
                const isKnownExpertiseType = parent!.type in CONFIG.COSMERE.expertiseTypes;
                
                if (isKnownExpertiseType && !!parent.actor) {
                    // Check if the actor has the expertise
                    const actorHasExpertise = parent.actor.system.expertises.some(
                        expertise => expertise.id === system.type
                    );

                    // If the actor has the expertise, enable it
                    if (actorHasExpertise) {
                        system.expertise = true;
                    }
                }
            }
        }
    }
}