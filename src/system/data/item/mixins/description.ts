export interface DescriptionItemData {
    description?: {
        value?: string;
        chat?: string;
    }
}

export function DescriptionItemMixin() {
    return (base: typeof foundry.abstract.TypeDataModel) => {
        return class mixin<P extends Document> extends base<P> {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    description: new foundry.data.fields.SchemaField({
                        value: new foundry.data.fields.HTMLField({
                            label: 'Description'
                        }),
                        chat: new foundry.data.fields.HTMLField({
                            label: 'Chat description'
                        })
                    })
                });
            }
        }
    }
}