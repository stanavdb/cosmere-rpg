import { CosmereItem } from '@system/documents';

interface TypedItemMixinOptions<Type extends string = string> {
    initial?: Type;
    choices?: Type[] | (() => Type[]);
}

export interface TypedItemData<T extends string = string> {
    type: T;
}

export function TypedItemMixin<
    P extends CosmereItem,
    Type extends string = string,
>(options: TypedItemMixinOptions<Type> = {}) {
    return (base: typeof foundry.abstract.TypeDataModel<TypedItemData, P>) => {
        return class extends base {
            static defineSchema() {
                const choices =
                    typeof options.choices === 'function'
                        ? options.choices()
                        : options.choices;

                return foundry.utils.mergeObject(super.defineSchema(), {
                    type: new foundry.data.fields.StringField({
                        required: true,
                        nullable: false,
                        initial: options.initial ?? 'unknown',
                        label: 'Type',
                        choices,
                    }),
                });
            }
        };
    };
}
