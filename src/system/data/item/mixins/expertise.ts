export interface ExpertiseItemData {
    expertise: boolean;
}

export function ExpertiseItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    expertise: new foundry.data.fields.BooleanField({
                        required: true, nullable: false, initial: false, label: 'Expertise'
                    })
                });
            }
        }
    }
}