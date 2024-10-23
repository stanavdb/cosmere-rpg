import { ActivationType } from '@system/types/cosmere';
import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseItemSheet, BaseItemSheetRenderContext } from '../base';

export class DetailsDamageComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseItemSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/item/components/details-damage.hbs';

    /* eslint-disable @typescript-eslint/unbound-method */
    static ACTIONS = {
        'toggle-graze-collapsed': DetailsDamageComponent.onToggleGrazeCollapsed,
    };
    /* eslint-enable @typescript-eslint/unbound-method */
    private grazeOverrideCollapsed = true;

    /* --- Actions --- */

    private static onToggleGrazeCollapsed(this: DetailsDamageComponent) {
        this.grazeOverrideCollapsed = !this.grazeOverrideCollapsed;
        void this.render();
    }

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
            grazeInputCollapsed:
                this.grazeOverrideCollapsed ||
                this.application.item.system.damage.grazeOverrideFormula !==
                    undefined,

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
