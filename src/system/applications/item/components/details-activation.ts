import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseItemSheet, BaseItemSheetRenderContext } from '../base';

export class DetailsActivationComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseItemSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/item/components/details-activation.hbs';

    /* --- Context --- */

    public _prepareContext(params: never, context: BaseItemSheetRenderContext) {
        return Promise.resolve({
            ...context,
            ...this.prepareActivationContext(),
            hasActivation: this.application.item.hasActivation(),
        });
    }

    private prepareActivationContext() {
        if (!this.application.item.hasActivation()) return {};

        // Get the activation data
        const { activation } = this.application.item.system;

        return {
            hasActivationCost: !!activation.cost.type,
            hasConsume: !!activation.consume,
            hasSkill: !!activation.skill,

            typeSelectOptions: Object.entries(
                CONFIG.COSMERE.items.activation.types,
            ).reduce(
                (acc, [key, config]) => ({
                    ...acc,
                    [key]: config.label,
                }),
                {},
            ),
            costTypeSelectOptions: {
                none: 'GENERIC.None',
                ...Object.entries(CONFIG.COSMERE.action.costs).reduce(
                    (acc, [key, config]) => ({
                        ...acc,
                        [key]: config.label,
                    }),
                    {},
                ),
            },
            consumeTypeSelectOptions: {
                none: 'GENERIC.None',
                ...Object.entries(
                    CONFIG.COSMERE.items.activation.consumeTypes,
                ).reduce(
                    (acc, [key, config]) => ({
                        ...acc,
                        [key]: config.label,
                    }),
                    {},
                ),
            },
            actorResourceSelectOptions: {
                none: 'GENERIC.None',
                ...Object.entries(CONFIG.COSMERE.resources).reduce(
                    (acc, [key, config]) => ({
                        ...acc,
                        [key]: config.label,
                    }),
                    {},
                ),
            },
            itemResourceSelectOptions: {
                none: 'GENERIC.None',
                ...Object.entries(CONFIG.COSMERE.items.resources.types).reduce(
                    (acc, [key, config]) => ({
                        ...acc,
                        [key]: config.label,
                    }),
                    {},
                ),
            },
            skillSelectOptions: {
                none: 'GENERIC.None',
                ...Object.entries(CONFIG.COSMERE.skills).reduce(
                    (acc, [key, config]) => ({
                        ...acc,
                        [key]: config.label,
                    }),
                    {},
                ),
            },
            attributeSelectOptions: {
                none: 'GENERIC.Default',
                ...Object.entries(CONFIG.COSMERE.attributes).reduce(
                    (acc, [key, config]) => ({
                        ...acc,
                        [key]: config.label,
                    }),
                    {},
                ),
            },
        };
    }
}

// Register the component
DetailsActivationComponent.register('app-item-details-activation');
