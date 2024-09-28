import { CosmereItem } from '@system/documents';

interface IdItemMixinOptions<Type extends string = string> {
    initialFromName?: boolean;
    initial?: Type | (() => Type);
    choices?:
        | Type[]
        | Record<Type, string>
        | (() => Type[] | Record<Type, string>);
}

export interface IdItemData<Type extends string = string> {
    id: Type;
}

export function IdItemMixin<
    P extends CosmereItem,
    Type extends string = string,
>(options: IdItemMixinOptions<Type> = {}) {
    if (options.initialFromName && options.initial)
        throw new Error(
            'Cannot specify both initialFromName and initial options',
        );
    if (options.initialFromName && options.choices)
        throw new Error(
            'Cannot specify both initialFromName and choices options',
        );

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
                        initial:
                            initial ??
                            (options.initialFromName ? '<id>' : undefined),
                        choices,
                    }),
                });
            }

            public prepareDerivedData() {
                super.prepareDerivedData();

                if (this.id === '<id>' && options.initialFromName) {
                    this.id = this.parent.name
                        .toLowerCase()
                        .replace(/\s/g, '-')
                        .replace(/[^a-z0-9-_]/g, '') as Type;
                }
            }
        };
    };
}
