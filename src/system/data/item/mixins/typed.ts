import { CosmereItem } from '@system/documents';

interface TypedItemMixinOptions<Type extends string = string> {
    initial?: Type;
    choices?:
        | Type[]
        | Record<Type, string>
        | (() => Type[] | Record<Type, string>);
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

            get typeSelectOptions(): Record<string | number, string> {
                const choices = (
                    this.schema.fields.type as foundry.data.fields.StringField
                ).choices;

                if (Array.isArray(choices)) {
                    return (choices as string[]).reduce(
                        (acc, key, i) => ({
                            ...acc,
                            [i]: key,
                        }),
                        {} as Record<number, string>,
                    );
                } else {
                    return choices as Record<string, string>;
                }
            }
        };
    };
}
