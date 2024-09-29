import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseItemSheet, BaseItemSheetRenderContext } from '../base';
import { ActivationType } from '@src/system/types/cosmere';

export class DetailsDamageComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseItemSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/item/components/details-damage.hbs';

    /* --- Context --- */

    public _prepareContext(params: never, context: BaseItemSheetRenderContext) {
        return Promise.resolve({
            ...context,
            ...this.prepareDamageContext(),
            hasDamage: this.application.item.hasDamage(),
        });
    }

    private prepareDamageContext() {
        if (!this.application.item.hasDamage()) return {};

        const hasSkillTest =
            this.application.item.hasActivation() &&
            this.application.item.system.activation.type ===
                ActivationType.SkillTest;
        const hasSkill =
            hasSkillTest && this.application.item.system.activation.skill;

        return {
            hasSkillTest,
            hasSkill,

            typeSelectOptions: {
                none: '—',
                ...Object.entries(CONFIG.COSMERE.damageTypes).reduce(
                    (acc, [key, config]) => ({
                        ...acc,
                        [key]: config.label,
                    }),
                    {},
                ),
            },

            ...(hasSkillTest
                ? {
                      skillSelectOptions: {
                          none: 'GENERIC.Default',
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
                  }
                : {}),
        };
    }
}

// Register the component
DetailsDamageComponent.register('app-item-details-damage');
