import { ArmorTraitId, WeaponTraitId } from '@system/types/cosmere';
import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseItemSheet, BaseItemSheetRenderContext } from '../base';

export class DetailsEquipComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseItemSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/item/components/details-equip.hbs';

    /* --- Context --- */

    public _prepareContext(params: never, context: BaseItemSheetRenderContext) {
        const isEquippable = this.application.item.isEquippable();

        if (!isEquippable) {
            return Promise.resolve({
                ...context,
                isEquippable,
            });
        }

        return Promise.resolve({
            ...context,
            isEquippable,
            equipTypes: Object.entries(CONFIG.COSMERE.items.equip.types).reduce(
                (acc, [key, type]) => ({
                    ...acc,
                    [key]: type.label,
                }),
                {},
            ),
            holdTypeLabel: this.application.item.system.equip.hold
                ? CONFIG.COSMERE.items.equip.hold[
                      this.application.item.system.equip.hold
                  ].label
                : '—',
            traits: this.prepareTraitsData(),
            expertTraits: this.prepareExpertTraitsData(),
        });
    }

    private prepareTraitsData() {
        const item = this.application.item;

        if (!item.isArmor() && !item.isWeapon()) return null;

        const isArmor = item.isArmor();

        return Object.entries(
            isArmor
                ? CONFIG.COSMERE.traits.armorTraits
                : CONFIG.COSMERE.traits.weaponTraits,
        ).map(([id, config]) => {
            // Look up trait
            const traitData = isArmor
                ? item.system.traits[id as ArmorTraitId]
                : item.system.traits[id as WeaponTraitId];

            return {
                id,
                label: config.label,
                hasValue: config.hasValue ?? false,
                active: traitData?.defaultActive,
                value: traitData?.defaultValue,
            };
        });
    }

    private prepareExpertTraitsData() {
        const item = this.application.item;

        if (!item.isArmor() && !item.isWeapon()) return null;

        const isArmor = item.isArmor();

        return Object.entries(
            isArmor
                ? CONFIG.COSMERE.traits.armorTraits
                : CONFIG.COSMERE.traits.weaponTraits,
        )
            .map(([id, config]) => {
                // Look up trait
                const traitData = isArmor
                    ? item.system.traits[id as ArmorTraitId]
                    : item.system.traits[id as WeaponTraitId];

                if (traitData?.defaultActive) {
                    return [
                        ...(traitData?.defaultValue
                            ? [
                                  {
                                      id,
                                      type: 'modify-trait-value',
                                      label: game
                                          .i18n!.localize(
                                              'COSMERE.Item.Sheet.Equip.ModifyTraitValue',
                                          )
                                          .replace(
                                              '[trait]',
                                              game.i18n!.localize(config.label),
                                          )
                                          .replace(
                                              '[value]',
                                              traitData.defaultValue.toString(),
                                          ),
                                      value:
                                          traitData.expertise.value ??
                                          traitData.defaultValue,
                                      active: !!traitData.expertise.value,
                                  },
                              ]
                            : []),

                        {
                            id,
                            type: 'lose-trait',
                            label: game
                                .i18n!.localize(
                                    'COSMERE.Item.Sheet.Equip.LoseTrait',
                                )
                                .replace(
                                    '[trait]',
                                    game.i18n!.localize(config.label),
                                ),
                            active: traitData.expertise.toggleActive,
                        },
                    ];
                } else {
                    return [
                        {
                            id,
                            type: 'gain-trait',
                            label: config.label,
                            active: traitData?.expertise.toggleActive,
                            value: traitData?.defaultValue,
                        },
                    ];
                }
            })
            .flat();
    }
}

// Register the component
DetailsEquipComponent.register('app-item-details-equip');
