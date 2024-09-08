import './application';

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
Handlebars.registerHelper('mod', (a: number, b: number) => a % b);

Handlebars.registerHelper('default', (v: unknown, defaultVal: unknown) => {
    return v ? v : defaultVal;
});

Handlebars.registerHelper('perc', (value: number, max: number) => {
    return `${Math.floor((value / max) * 100)}%`;
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

Handlebars.registerHelper('derived', (derived?: Derived<string | number>) => {
    if (!derived) return;
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

Handlebars.registerHelper(
    'itemContext',
    (item: CosmereItem, options?: { hash?: ItemContextOptions }) => {
        try {
            const context = {} as Partial<ItemContext>;
            const subtitle = [] as { text: string; classes?: string[] }[];

            const isWeapon = item.isWeapon();

            if (isWeapon) {
                context.isWeapon = true;

                const attack = item.system.attack;

                subtitle.push({
                    text: game.i18n!.localize(
                        CONFIG.COSMERE.attack.types[attack.type].label,
                    ),
                });

                if (attack.range?.value) {
                    if (attack.type === AttackType.Melee) {
                        subtitle[0].text += ` + ${attack.range.value}`;
                    } else {
                        subtitle[0].text += ` (${attack.range.value}${attack.range.units}${
                            attack.range.long
                                ? `/${attack.range.long}${attack.range.units}`
                                : ''
                        })`;
                    }
                }
            }

            if (item.isArmor() && item.system.deflect) {
                subtitle.push({
                    text: `${game.i18n!.localize(
                        'COSMERE.Item.Armor.Deflect',
                    )} [${item.system.deflect}]`,
                });
            }

            if (item.isPhysical()) {
                context.isPhysical = true;
                context.hasQuantity = item.system.quantity !== null;
                context.hasWeight = item.system.weight.value !== null;
                context.quantity = item.system.quantity;
                context.weight = {
                    value: item.system.weight.value,
                    unit: item.system.weight.unit,
                    total:
                        (item.system.quantity ?? 0) *
                        (item.system.weight.value ?? 0),
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
                const hand = item.system.equip.hand;

                context.equip = {
                    type,
                    typeLabel: CONFIG.COSMERE.items.equip.types[type].label,

                    hold,
                    ...(hold
                        ? {
                              holdLabel:
                                  CONFIG.COSMERE.items.equip.hold[hold].label,
                          }
                        : {}),

                    hand,
                    ...(hand
                        ? {
                              handLabel:
                                  CONFIG.COSMERE.items.equip.hand[hand].label,
                          }
                        : {}),
                };

                if (options?.hash?.showEquippedHand !== false) {
                    if (hold && hold !== HoldType.TwoHanded) {
                        subtitle.push({
                            text: game.i18n!.localize(
                                CONFIG.COSMERE.items.equip.hold[hold].label,
                            ),
                        });
                    }
                }
            }

            if (item.hasTraits()) {
                subtitle.push(
                    ...Array.from(item.system.traits)
                        .filter((trait) => trait.active)
                        .map((trait) => {
                            // Get trait data
                            const data = item.system.traits.find(
                                (t) => t.id === trait.id,
                            )!;

                            // Get the config
                            const config = isWeapon
                                ? CONFIG.COSMERE.traits.weaponTraits[
                                      trait.id as WeaponTraitId
                                  ]
                                : CONFIG.COSMERE.traits.armorTraits[
                                      trait.id as ArmorTraitId
                                  ];

                            const modifiedByExpertise =
                                trait.active !== trait.defaultActive ||
                                trait.value !== trait.defaultValue;

                            return {
                                text: `${game.i18n!.localize(config.label)} ${config.hasValue ? `[${data.value}]` : ''}`.trim(),
                                classes: modifiedByExpertise
                                    ? ['highlight']
                                    : [],
                            };
                        }),
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

                    if (consumesItemResource && item.system.resources) {
                        // Get the resource
                        const resource =
                            item.system.resources[
                                context.consume.resource as ItemResource
                            ];

                        const resourceHasRecharge = !!resource?.recharge;
                        const resourceRecharge = resource?.recharge;
                        const resourceRechargeLabel = resourceHasRecharge
                            ? CONFIG.COSMERE.items.resources.recharge[
                                  resource.recharge!
                              ].label
                            : undefined;

                        context.consume = {
                            ...context.consume,
                            resourceHasRecharge,
                            resourceRecharge,
                            resourceRechargeLabel,
                        };
                    }
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
                    subtitle.splice(0, subtitle.length, {
                        text: item.system.description.short,
                    });
                }
            }

            return {
                ...context,
                subtitle: subtitle
                    .map(
                        ({ text, classes }) =>
                            `<span class=${(classes ?? []).join(' ')}>${text}</span>`,
                    )
                    .join('<span>, </span>'),
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
        'systems/cosmere-rpg/templates/general/tabs.hbs',
        'systems/cosmere-rpg/templates/actors/character/partials/char-details-tab.hbs',
        'systems/cosmere-rpg/templates/actors/character/partials/char-actions-tab.hbs',
        'systems/cosmere-rpg/templates/actors/character/partials/char-equipment-tab.hbs',
        'systems/cosmere-rpg/templates/actors/character/partials/char-goals-tab.hbs',
        'systems/cosmere-rpg/templates/actors/character/partials/char-effects-tab.hbs',
        'systems/cosmere-rpg/templates/combat/combatant.hbs',
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
