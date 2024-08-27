import {
    ArmorTraitId,
    WeaponTraitId,
    Skill,
    Attribute,
    ItemConsumeType,
    Resource,
    ItemResource,
    ItemType,
    ActionCostType,
    DamageType,
    HoldType,
    AttackType,
} from '@src/system/types/cosmere';

import { CharacterActor, CosmereActor } from '@system/documents/actor';
import { CosmereItem } from '@system/documents/item';
import { Derived } from '@system/data/fields';

import { ItemContext, ItemContextOptions } from './types';

Handlebars.registerHelper('add', (a: number, b: number) => a + b);
Handlebars.registerHelper('sub', (a: number, b: number) => a - b);
Handlebars.registerHelper('multi', (a: number, b: number) => a * b);
Handlebars.registerHelper('divide', (a: number, b: number) => a / b);

Handlebars.registerHelper('default', (v: unknown, defaultVal: unknown) => {
    return v ? v : defaultVal;
});

Handlebars.registerHelper(
    'times',
    (count: unknown, options: Handlebars.HelperOptions): string =>
        [...Array(Number(count) || 0).keys()]
            .map((i) =>
                options.fn(i, {
                    data: options.data as unknown,
                    blockParams: [i],
                }),
            )
            .join(''),
);

Handlebars.registerHelper('cosmereDingbat', (type: ActionCostType) => {
    switch (type) {
        case ActionCostType.FreeAction:
            return '0';
        case ActionCostType.Reaction:
            return 'r';
        case ActionCostType.Special:
            return '*';
        default:
            return '';
    }
});

Handlebars.registerHelper(
    'greaterThan',
    (a: number, b: number, equal?: boolean) => (equal ? a >= b : a > b),
);

Handlebars.registerHelper(
    'expertisesList',
    (actor: CharacterActor, defaultValue = '-'): string => {
        if (!actor.system.expertises?.length) return defaultValue;
        return actor.system.expertises
            .map(
                (expertise) =>
                    `${expertise.label} (${game.i18n!.localize(
                        CONFIG.COSMERE.expertiseTypes[expertise.type].label,
                    )})`,
            )
            .join(', ');
    },
);

Handlebars.registerHelper('derived', (derived: Derived<string | number>) => {
    return Derived.getValue(derived);
});

Handlebars.registerHelper(
    'skillMod',
    (actor: CosmereActor, skill: Skill, attribute?: Attribute) => {
        return actor.getSkillMod(skill, attribute);
    },
);

Handlebars.registerHelper(
    'formulaReplaceData',
    (formula: string, data: Record<string, unknown>) => {
        return Roll.replaceFormulaData(formula, data, { missing: '0' });
    },
);

Handlebars.registerHelper('itemHoldSelect', (selected?: HoldType) => {
    const holdTypes = Object.keys(
        CONFIG.COSMERE.items.equip.hold,
    ) as HoldType[];

    return `
        <ul class="dropdown">
        ${holdTypes
            .map((hold) => {
                // Get the config
                const config = CONFIG.COSMERE.items.equip.hold[hold];

                const isSelected = hold === selected;

                return `
            <li class="option">
                <a role="button" 
                    data-type="${hold}"
                    data-action="equip-hold" 
                    class="option-select ${isSelected ? 'selected' : ''}" 
                    title="${game.i18n!.localize(config.label)}"
                >
                    ${config.icon}
                </a>
            </li>    
        `;
            })
            .join('\n')}
        </ul>
    `;
});

Handlebars.registerHelper(
    'itemContext',
    (item: CosmereItem, options?: { hash?: ItemContextOptions }) => {
        try {
            const context = {} as Partial<ItemContext>;
            const subtitle = [] as string[];

            const isWeapon = item.isWeapon();

            if (isWeapon) {
                const attack = item.system.attack;

                subtitle.push(
                    game.i18n!.localize(
                        CONFIG.COSMERE.attack.types[attack.type].label,
                    ),
                );

                if (attack.range?.value) {
                    if (attack.type === AttackType.Melee) {
                        subtitle[0] += ` + ${attack.range.value}`;
                    } else {
                        subtitle[0] += ` (${attack.range.value}${attack.range.units}${
                            attack.range.long
                                ? `/${attack.range.long}${attack.range.units}`
                                : ''
                        })`;
                    }
                }
            }

            if (item.isPhysical()) {
                context.isPhysical = true;
                context.quantity = item.system.quantity;
                context.weight = {
                    value: item.system.weight.value,
                    unit: item.system.weight.unit,
                };
                context.price = {
                    value: item.system.price.value,
                    unit: item.system.price.unit,
                };
            }

            if (item.isEquippable() && !item.system.alwaysEquipped) {
                context.isEquippable = true;
                context.equipped = item.system.equipped;

                const type = item.system.equip.type;
                const hold = item.system.equip.hold;

                context.equip = {
                    type,
                    typeLabel: CONFIG.COSMERE.items.equip.types[type].label,
                    typeIcon: CONFIG.COSMERE.items.equip.types[type].icon,

                    hold,
                    ...(hold
                        ? {
                              holdLabel:
                                  CONFIG.COSMERE.items.equip.hold[hold].label,
                              holdIcon:
                                  CONFIG.COSMERE.items.equip.hold[hold].icon,
                          }
                        : {}),
                };

                if (options?.hash?.showEquippedHand !== false) {
                    if (hold && hold !== HoldType.TwoHanded) {
                        subtitle.push(
                            game.i18n!.localize(
                                CONFIG.COSMERE.items.equip.hold[hold].label,
                            ),
                        );
                    }
                }
            }

            if (item.hasTraits()) {
                subtitle.push(
                    ...Array.from(item.system.traits)
                        .filter((trait) => trait.active)
                        .map((trait) => trait.id)
                        .map((traitId) =>
                            isWeapon
                                ? CONFIG.COSMERE.traits.weaponTraits[
                                      traitId as WeaponTraitId
                                  ].label
                                : CONFIG.COSMERE.traits.armorTraits[
                                      traitId as ArmorTraitId
                                  ].label,
                        )
                        .map((label) => game.i18n!.localize(label)),
                );
            }

            if (item.hasActivation()) {
                context.hasActivation = true;
                context.activation = {};

                if (item.system.activation.cost?.type) {
                    context.activation.hasCost = true;
                    context.activation.cost = {
                        type: item.system.activation.cost.type,
                        typeLabel:
                            CONFIG.COSMERE.action.costs[
                                item.system.activation.cost.type
                            ].label,
                        value: item.system.activation.cost.value,
                    };
                }

                // Check if a skill test is configured
                if (item.system.activation.skill) {
                    const skill = item.system.activation.skill;
                    const attribute = item.system.activation.attribute;

                    context.hasSkillTest = true;
                    context.skillTest = {
                        skill,
                        skillLabel: CONFIG.COSMERE.skills[skill].label,
                        usesDefaultAttribute:
                            !attribute ||
                            attribute ===
                                CONFIG.COSMERE.skills[skill].attribute,

                        ...(attribute
                            ? {
                                  attribute,
                                  attributeLabel:
                                      CONFIG.COSMERE.attributes[attribute]
                                          .label,
                                  attributeLabelShort:
                                      CONFIG.COSMERE.attributes[attribute]
                                          .labelShort,
                              }
                            : {}),
                    };
                }

                // Check if the activation consumes some resource
                if (item.system.activation.consume) {
                    // Get the actor resource consumed
                    const resource = item.system.activation.consume.resource;
                    const consumesActorResource =
                        item.system.activation.consume.type ===
                        ItemConsumeType.ActorResource;
                    const consumesItemResource =
                        item.system.activation.consume.type ===
                        ItemConsumeType.ItemResource;

                    context.hasConsume = true;
                    context.consume = {
                        type: item.system.activation.consume.type,
                        value: item.system.activation.consume.value,
                        consumesActorResource,
                        consumesItemResource,
                        consumesItem:
                            item.system.activation.consume.type ===
                            ItemConsumeType.Item,

                        ...(resource
                            ? {
                                  resource,
                                  resourceLabel: consumesActorResource
                                      ? CONFIG.COSMERE.resources[
                                            resource as Resource
                                        ].label
                                      : CONFIG.COSMERE.items.resources.types[
                                            resource as ItemResource
                                        ].label,
                              }
                            : {}),
                    };
                }

                // Check if item has resources
                if (item.system.resources) {
                    context.hasResources = true;

                    // Assign resources
                    context.resources = (
                        Object.keys(item.system.resources) as ItemResource[]
                    )
                        .map((resourceType) => {
                            // Get resource
                            const resource =
                                item.system.resources![resourceType];
                            if (!resource) return null;

                            // Get resource config
                            const resourceConfig =
                                CONFIG.COSMERE.items.resources.types[
                                    resourceType
                                ];

                            const hasMax = resource.max != null;
                            const hasRecharge = resource.recharge != null;

                            return {
                                id: resourceType,
                                label:
                                    resource.value > 1
                                        ? resourceConfig.labelPlural
                                        : resourceConfig.label,
                                value: resource.value,
                                hasMax,
                                max: hasMax ? resource.max : resource.value,

                                hasRecharge,
                                ...(hasRecharge
                                    ? {
                                          recharge: resource.recharge,
                                          rechargeLabel:
                                              CONFIG.COSMERE.items.resources
                                                  .recharge[resource.recharge!]
                                                  .label,
                                      }
                                    : {}),
                            };
                        })
                        .filter((v) => !!v);
                }
            }

            if (item.hasDamage() && item.system.damage.formula) {
                const skill = item.system.damage.skill;
                const attribute = item.system.damage.attribute;

                const hasSkill = !!skill;
                const hasAttribute = !!attribute;

                context.hasDamage = true;
                context.damage = {
                    formula: item.system.damage.formula,
                    formulaData: {
                        ...item.actor?.getRollData(),
                    },
                    hasSkill,
                    hasAttribute,

                    ...(hasSkill
                        ? {
                              skill,
                              skillLabel: CONFIG.COSMERE.skills[skill].label,
                              usesDefaultAttribute:
                                  !hasAttribute ||
                                  attribute ===
                                      CONFIG.COSMERE.skills[skill].attribute,
                          }
                        : {}),

                    ...(hasAttribute
                        ? {
                              attribute,
                              attributeLabel:
                                  CONFIG.COSMERE.attributes[attribute].label,
                              attributeLabelShort:
                                  CONFIG.COSMERE.attributes[attribute]
                                      .labelShort,
                          }
                        : {}),

                    ...(item.system.damage.type
                        ? {
                              type: item.system.damage.type,
                              typeLabel:
                                  CONFIG.COSMERE.damageTypes[
                                      item.system.damage.type
                                  ].label,
                          }
                        : {}),
                };
            }

            if (item.hasDescription()) {
                if (
                    item.system.description?.short &&
                    item.type === ItemType.Action
                ) {
                    subtitle.splice(
                        0,
                        subtitle.length,
                        item.system.description.short,
                    );
                }
            }

            return {
                ...context,
                subtitle: subtitle.join(', '),
            };
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
);

Handlebars.registerHelper('damageTypeConfig', (type: DamageType) => {
    return CONFIG.COSMERE.damageTypes[type];
});

export async function preloadHandlebarsTemplates() {
    const partials = [
        'systems/cosmere-rpg/templates/actors/parts/actions.hbs',
        'systems/cosmere-rpg/templates/actors/parts/inventory.hbs',
        // 'systems/cosmere-rpg/templates/chat/parts/roll-details.hbs',
    ];

    return await loadTemplates(
        partials.reduce(
            (partials, path) => {
                partials[path.split('/').pop()!.replace('.hbs', '')] = path;
                return partials;
            },
            {} as Record<string, string>,
        ),
    );
}
