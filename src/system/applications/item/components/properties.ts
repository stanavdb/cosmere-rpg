import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseItemSheet, BaseItemSheetRenderContext } from '../base';

export class ItemPropertiesComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseItemSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/item/components/properties.hbs';

    /* --- Context --- */

    public _prepareContext(params: never, context: BaseItemSheetRenderContext) {
        const isPhysical = this.application.item.isPhysical();
        const hasProperties = isPhysical;

        return Promise.resolve({
            ...context,
            isPhysical,
            hasProperties,

            units: {
                weight: CONFIG.COSMERE.units.weight.reduce(
                    (acc, unit) => ({
                        ...acc,
                        [unit]: unit,
                    }),
                    {},
                ),
                price: {
                    none: '—',
                    ...Object.entries(CONFIG.COSMERE.currencies).reduce(
                        (acc, [currencyId, currency]) => {
                            // Get all primary denominations with units
                            const denominations =
                                currency.denominations.primary.filter(
                                    (denomination) => denomination.unit,
                                );

                            return {
                                ...acc,
                                ...denominations.reduce(
                                    (acc, denomination) => ({
                                        ...acc,
                                        [`${currencyId}.${denomination.id}`]:
                                            denomination.unit!,
                                    }),
                                    {},
                                ),
                            };
                        },
                        {},
                    ),
                },
            },
        });
    }
}

// Register component
ItemPropertiesComponent.register('app-item-properties');
