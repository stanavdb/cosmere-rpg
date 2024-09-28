import { CosmereItem } from '@system/documents';

export interface PhysicalItemData {
    quantity: number;
    weight: {
        value: number;
        unit: string;
    };
    price: {
        value: number;
        unit: string; // Dervived from currency / denomination
        currency: string;
        denomination: {
            primary: string;
            secondary?: string;
        };
        baseValue: number; // Derived value in base denomination
    };
}

export function PhysicalItemMixin<P extends CosmereItem>() {
    return (
        base: typeof foundry.abstract.TypeDataModel<PhysicalItemData, P>,
    ) => {
        return class extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    quantity: new foundry.data.fields.NumberField({
                        min: 0,
                        initial: 1,
                        integer: true,
                    }),
                    weight: new foundry.data.fields.SchemaField({
                        value: new foundry.data.fields.NumberField({
                            min: 0,
                            initial: 0,
                            required: true,
                        }),
                        unit: new foundry.data.fields.StringField({
                            required: true,
                            initial: CONFIG.COSMERE.units.weight[0],
                            choices: CONFIG.COSMERE.units.weight,
                        }),
                    }),
                    price: new foundry.data.fields.SchemaField({
                        value: new foundry.data.fields.NumberField({
                            min: 0,
                            initial: 0,
                            required: true,
                        }),
                        currency: new foundry.data.fields.StringField({
                            required: true,
                            initial: 'none',
                            choices: {
                                none: game.i18n!.localize('GENERIC.None'),
                                ...Object.entries(
                                    CONFIG.COSMERE.currencies,
                                ).reduce(
                                    (acc, [id, currency]) => ({
                                        ...acc,
                                        [id]: currency.label,
                                    }),
                                    {},
                                ),
                            },
                        }),
                        denomination: new foundry.data.fields.SchemaField({
                            primary: new foundry.data.fields.StringField({
                                required: true,
                                initial: 'none',
                                choices: {
                                    none: game.i18n!.localize('GENERIC.None'),
                                    ...Object.entries(
                                        CONFIG.COSMERE.currencies,
                                    ).reduce(
                                        (acc, [currencyId, currency]) => ({
                                            ...acc,
                                            ...currency.denominations.primary.reduce(
                                                (acc, denomination) => ({
                                                    ...acc,
                                                    [denomination.id]:
                                                        denomination.label,
                                                }),
                                                {},
                                            ),
                                        }),
                                        {},
                                    ),
                                },
                            }),
                            secondary: new foundry.data.fields.StringField({
                                required: false,
                                initial: 'none',
                                choices: {
                                    none: game.i18n!.localize('GENERIC.None'),
                                    ...Object.entries(CONFIG.COSMERE.currencies)
                                        .filter(
                                            ([_, currency]) =>
                                                currency.denominations
                                                    .secondary,
                                        )
                                        .reduce(
                                            (acc, [currencyId, currency]) => ({
                                                ...acc,
                                                ...currency.denominations.secondary!.reduce(
                                                    (acc, denomination) => ({
                                                        ...acc,
                                                        [denomination.id]:
                                                            denomination.label,
                                                    }),
                                                    {},
                                                ),
                                            }),
                                            {},
                                        ),
                                },
                            }),
                        }),
                        unit: new foundry.data.fields.StringField(),
                    }),
                });
            }

            public prepareDerivedData() {
                super.prepareDerivedData();

                if (
                    this.price.currency === 'none' ||
                    this.price.denomination.primary === 'none'
                ) {
                    this.price.unit = '—';
                    this.price.baseValue = this.price.value;
                } else {
                    const currency =
                        CONFIG.COSMERE.currencies[this.price.currency];

                    const primary = currency.denominations.primary.find(
                        (denomination) =>
                            denomination.id === this.price.denomination.primary,
                    )!;
                    const secondary = currency.denominations.secondary?.find(
                        (denomination) =>
                            denomination.id ===
                            this.price.denomination.secondary,
                    );

                    // Set unit
                    this.price.unit = `${this.price.currency}.${primary.id}`;

                    // Calculate base value
                    this.price.baseValue =
                        this.price.value *
                        primary.conversionRate *
                        (secondary ? secondary.conversionRate : 1);
                }
            }
        };
    };
}
