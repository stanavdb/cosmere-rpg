import { CosmereItem } from '@system/documents';

interface IdItemMixinOptions<Type extends string = string> {
    initial?: Type | (() => Type);
    choices?: Type[] | (() => Type[]);
}

export interface IdItemData<Type extends string = string> {
    id: Type;
}

export function IdItemMixin<
    P extends CosmereItem,
    Type extends string = string,
>(options: IdItemMixinOptions<Type> = {}) {
    return (
        base: typeof foundry.abstract.TypeDataModel<IdItemData<Type>, P>,
    ) => {
        return class extends base {
            static defineSchema() {
                const choices =
                    typeof options.choices === 'function'
                        ? options.choices()
                        : options.choices;

                const initial =
                    typeof options.initial === 'function'
                        ? options.initial()
                        : options.initial;

                return foundry.utils.mergeObject(super.defineSchema(), {
                    id: new foundry.data.fields.StringField({
                        required: true,
                        nullable: false,
                        blank: false,
                        initial: initial,
                        choices,
                    }),
                });
            }
        };
    };
}
