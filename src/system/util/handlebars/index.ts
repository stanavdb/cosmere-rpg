import {
    ArmorTraitId,
    WeaponTraitId,
    Skill,
    Attribute,
    ItemConsumeType,
} from '@src/system/types/cosmere';

import { CharacterActor, CosmereActor } from '@system/documents/actor';
import { CosmereItem } from '@system/documents/item';
import { Derived } from '@system/data/fields';

import { ItemContext } from './types';

Handlebars.registerHelper('add', (a: number, b: number) => a + b);
Handlebars.registerHelper('sub', (a: number, b: number) => a - b);
Handlebars.registerHelper('multi', (a: number, b: number) => a * b);
Handlebars.registerHelper('divide', (a: number, b: number) => a / b);

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
                    `${expertise.label} (${CONFIG.COSMERE.expertiseTypes[expertise.type].label})`,
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

Handlebars.registerHelper('itemContext', (item: CosmereItem) => {
    const context = {} as ItemContext;
    const subtitle = [] as string[];

    const isWeapon = item.isWeapon();

    if (isWeapon) {
        subtitle.push(
            game.i18n!.localize(
                CONFIG.COSMERE.attack.types[item.system.attack.type].label,
            ),
        );
    }

    if (item.hasTraits()) {
        subtitle.push(
            ...Array.from(item.system.traits)
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
                    attribute === CONFIG.COSMERE.skills[skill].attribute,

                ...(attribute
                    ? {
                          attribute,
                          attributeLabel:
                              CONFIG.COSMERE.attributes[attribute].label,
                          attributeLabelShort:
                              CONFIG.COSMERE.attributes[attribute].labelShort,
                      }
                    : {}),
            };
        }

        // Check if the activation consumes some resource
        if (item.system.activation.consume) {
            // Get the actor resource consumed
            const resource = item.system.activation.consume.resource;

            context.hasConsume = true;
            context.consume = {
                type: item.system.activation.consume.type,
                value: item.system.activation.consume.value,
                consumesResource:
                    item.system.activation.consume.type ===
                    ItemConsumeType.Resource,
                consumesCharge:
                    item.system.activation.consume.type ===
                    ItemConsumeType.Charge,
                consumesItem:
                    item.system.activation.consume.type ===
                    ItemConsumeType.Item,

                ...(resource
                    ? {
                          resource,
                          resourceLabel:
                              CONFIG.COSMERE.resources[resource].label,
                      }
                    : {}),
            };
        }

        // Check if an activation cost is set
        if (item.system.activation.cost?.type) {
            subtitle.push(
                `${item.system.activation.cost.value ?? ''} ${game.i18n!.localize(
                    CONFIG.COSMERE.action.costs[
                        item.system.activation.cost.type
                    ].label,
                )}`.trim(),
            );
        }

        // Check if item has resources
        if (item.system.resources) {
            context.hasResources = true;
            context.resources = {};

            // Check if item has charges
            if (item.system.resources.charge) {
                const hasMax = item.system.resources.charge.max != null;
                const hasRecharge =
                    item.system.resources.charge.recharge != null;

                context.resources.hasCharges = true;
                context.resources.charges = {
                    value: item.system.resources.charge.value,
                    hasMax,
                    max: hasMax
                        ? item.system.resources.charge.max
                        : item.system.resources.charge.value,
                    hasRecharge,

                    ...(hasRecharge
                        ? {
                              recharge: item.system.resources.charge.recharge,
                              rechargeLabel:
                                  CONFIG.COSMERE.items.activation.charges
                                      .recharge[
                                      item.system.resources.charge.recharge!
                                  ].label,
                          }
                        : {}),
                };
            }
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
                          attribute === CONFIG.COSMERE.skills[skill].attribute,
                  }
                : {}),

            ...(hasAttribute
                ? {
                      attribute,
                      attributeLabel:
                          CONFIG.COSMERE.attributes[attribute].label,
                      attributeLabelShort:
                          CONFIG.COSMERE.attributes[attribute].labelShort,
                  }
                : {}),

            ...(item.system.damage.type
                ? {
                      type: item.system.damage.type,
                      typeLabel:
                          CONFIG.COSMERE.damageTypes[item.system.damage.type]
                              .label,
                  }
                : {}),
        };
    }

    return {
        ...context,
        subtitle: subtitle.join(', '),
    };
});

export async function preloadHandlebarsTemplates() {
    const partials = [
        'systems/cosmere-rpg/templates/actors/parts/actions.hbs',
        'systems/cosmere-rpg/templates/actors/parts/inventory.hbs',
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
