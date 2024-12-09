import { AdvancementRuleConfig } from '@system/types/config';

import { CharacterActor } from '@system/documents/actor';
import {
    CosmereItem,
    TalentTreeItem,
    TalentItem,
} from '@system/documents/item';

import { Talent } from '@system/types/item';

// Constants
import { SYSTEM_ID } from '@system/constants';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */

interface CharacterState {
    level: number;
    attributes: Record<string, number>;
    skills: Record<string, { mod: number; rank: number }>;
    items: CosmereItem[];
}

/**
 * Returns the advancement rule for the given level.
 */
export function getAdvancementRuleForLevel(
    level: number,
): AdvancementRuleConfig {
    const rules = CONFIG.COSMERE.advancement.rules;
    return level >= rules.length
        ? rules[rules.length - 1] // Repeat the last rule if the level is higher than the last rule
        : rules[level - 1];
}

/**
 * Returns the all advancement rules up to and including the given level.
 * If the level is higher than the last rule, the last rule is repeated.
 * @returns An array of advancement rules with the length equal to the given level.
 */
export function getAdvancementRulesUpToLevel(
    level: number,
): AdvancementRuleConfig[] {
    return getAdvancementRulesForLevelChange(0, level);
}

/**
 * Returns the all advancement rules between the start level (exclusive) and the end level (inclusive).
 * If the end level is higher than the last rule, the last rule is repeated.
 */
export function getAdvancementRulesForLevelChange(
    startLevel: number,
    endLevel: number,
): (AdvancementRuleConfig & { level: number })[] {
    // Swap the levels if the end level is lower than the start level
    if (endLevel < startLevel)
        return getAdvancementRulesForLevelChange(
            endLevel,
            startLevel,
        ).reverse();

    // Ensure start level is at least 0
    startLevel = Math.max(0, startLevel);

    // Get the rules
    const rules = CONFIG.COSMERE.advancement.rules;
    return Array.from({ length: endLevel - startLevel }, (_, i) => {
        const index = startLevel + i;
        return index >= rules.length
            ? { ...rules[rules.length - 1], level: index + 1 }
            : { ...rules[index], level: index + 1 };
    });
}

/**
 * Derives the max health of a character at the given level and strength.
 * NOTE: This function currently retroactively applies changes to strength. Unsure if this is intended.
 */
export function deriveMaxHealth(level: number, strength: number): number;
export function deriveMaxHealth(
    rules: AdvancementRuleConfig[],
    strength: number,
): number;
export function deriveMaxHealth(
    levelOrRules: number | AdvancementRuleConfig[],
    strength: number,
): number {
    // Get rules up to the given level
    const rules = Array.isArray(levelOrRules)
        ? levelOrRules
        : getAdvancementRulesUpToLevel(levelOrRules);

    // Calculate the health
    return rules.reduce(
        (health, rule) =>
            health +
            (rule.health ?? 0) +
            (rule.healthIncludeStrength ? strength : 0),
        0,
    );
}

/**
 * Derives the total amount of attribute points a character of the given level has.
 * This does not account for attribute points spent.
 */
export function deriveTotalAttributePoints(level: number): number;
export function deriveTotalAttributePoints(
    rules: AdvancementRuleConfig[],
): number;
export function deriveTotalAttributePoints(
    levelOrRules: number | AdvancementRuleConfig[],
): number {
    // Get rules up to the given level
    const rules = Array.isArray(levelOrRules)
        ? levelOrRules
        : getAdvancementRulesUpToLevel(levelOrRules);

    // Calculate the attribute points
    return rules.reduce(
        (points, rule) => points + (rule.attributePoints ?? 0),
        0,
    );
}

/**
 * Derives the total amount of skill ranks a character of the given level has.
 * This does not account for skill ranks spent nor advancement rules that grant EITHER skill ranks or talents.
 */
export function deriveTotalSkillRanks(level: number): number;
export function deriveTotalSkillRanks(rules: AdvancementRuleConfig[]): number;
export function deriveTotalSkillRanks(
    levelOrRules: number | AdvancementRuleConfig[],
): number {
    // Get rules up to the given level
    const rules = Array.isArray(levelOrRules)
        ? levelOrRules
        : getAdvancementRulesUpToLevel(levelOrRules);

    // Calculate the skill ranks
    return rules.reduce((ranks, rule) => ranks + (rule.skillRanks ?? 0), 0);
}

/**
 * Derives the total amount of talents a character of the given level has.
 * This does not account for talents spent nor advancement rules that grant EITHER skill ranks or talents.
 */
export function deriveTotalTalents(level: number): number;
export function deriveTotalTalents(rules: AdvancementRuleConfig[]): number;
export function deriveTotalTalents(
    levelOrRules: number | AdvancementRuleConfig[],
): number {
    // Get rules up to the given level
    const rules = Array.isArray(levelOrRules)
        ? levelOrRules
        : getAdvancementRulesUpToLevel(levelOrRules);

    // Calculate the talents
    return rules.reduce((talents, rule) => talents + (rule.talents ?? 0), 0);
}

/**
 * Derives the total amount of skill ranks or talent choices a character of the given level has.
 */
export function deriveTotalSkillRanksOrTalentsChoices(level: number): number;
export function deriveTotalSkillRanksOrTalentsChoices(
    rules: AdvancementRuleConfig[],
): number;
export function deriveTotalSkillRanksOrTalentsChoices(
    levelOrRules: number | AdvancementRuleConfig[],
): number {
    // Get rules up to the given level
    const rules = Array.isArray(levelOrRules)
        ? levelOrRules
        : getAdvancementRulesUpToLevel(levelOrRules);

    // Calculate the skill ranks
    return rules.reduce(
        (choices, rule) => choices + (rule.skillRanksOrTalents ?? 0),
        0,
    );
}

export function getCharacterStateAtLevel(
    character: CharacterActor,
    level: number,
): CharacterState {
    const state: any = {
        level,
        attributes: Object.keys(CONFIG.COSMERE.attributes).reduce(
            (acc, key) => ({ ...acc, [key]: 0 }),
            {},
        ),
        skills: Object.keys(CONFIG.COSMERE.skills).reduce(
            (acc, key) => ({ ...acc, [key]: { mod: 0, rank: 0 } }),
            {},
        ),
        items: [],
    };

    new Array(level).fill(null).forEach((_, i) => {
        const level = i + 1;

        // Get attribute score changes at level
        const attributeChanges =
            character.getFlag<Record<string, number>>(
                SYSTEM_ID,
                `meta.changes.level${level}.attributes`,
            ) ?? {};

        // Get skill rank changes at level
        const skillChanges =
            character.getFlag<Record<string, number>>(
                SYSTEM_ID,
                `meta.changes.level${level}.skills`,
            ) ?? {};

        // Get item changes at level
        const itemChanges =
            character.getFlag<string[]>(
                SYSTEM_ID,
                `meta.changes.level${level}.items`,
            ) ?? [];

        // Apply changes
        Object.entries(attributeChanges).forEach(
            ([key, value]) => (state.attributes[key] += value),
        );
        Object.entries(skillChanges).forEach(
            ([key, value]) => (state.skills[key].rank += value),
        );
        itemChanges.forEach((change) => {
            // Get change type
            const type = change[0];

            // Get id
            const id = change.slice(1);

            if (type === '+') state.items.push(id);
            else if (type === '-')
                state.items = state.items.filter((i: string) => i !== id);
        });

        // Set skill mods
        Object.entries(CONFIG.COSMERE.skills).forEach(([id, config]) => {
            // Get attr value
            const attrValue = state.attributes[config.attribute];

            // Calculate mod
            const mod = attrValue + state.skills[id].rank;

            // Set mod
            state.skills[id].mod = mod;
        });
    });

    // Get the items
    state.items = state.items
        .map((id: string) => character.items.get(id))
        .filter((i: CosmereItem | undefined) => !!i);

    return state;
}

export async function getAvailableTalentsfromTree(
    talentTree: TalentTreeItem,
    state: CharacterState,
): Promise<TalentItem[]> {
    // Get talents
    const talents = await Promise.all(
        talentTree.system.talentUUIDs.map(
            async (uuid) => (await fromUuid(uuid)) as unknown as TalentItem,
        ),
    );

    // Filter out talents that are already obtained or have unmet prerequisites
    return talents
        .filter((talent) => !talentObtained(talent, state))
        .filter((talent) => talentPrerequisitesMet(talent, state));
}

/**
 * Utility function to check if a talent has been obtained by a character.
 */
function talentObtained(talent: TalentItem, state: CharacterState): boolean {
    return state.items.some(
        (item) => item.isTalent() && item.system.id === talent.system.id,
    );
}

/**
 * Utility function to check if the prerequisites of a talent are met for a given character state.
 */
function talentPrerequisitesMet(
    talent: TalentItem,
    state: CharacterState,
): boolean {
    const met = talent.system.prerequisitesArray.every((prerequisite) => {
        switch (prerequisite.type) {
            case Talent.Prerequisite.Type.Talent:
                return prerequisite.talents.every((ref) =>
                    state.items.some(
                        (item) => item.isTalent() && item.system.id === ref.id,
                    ),
                );
            case Talent.Prerequisite.Type.Skill:
                return (
                    state.skills[prerequisite.skill].mod >=
                    (prerequisite.rank ?? 1)
                );
            case Talent.Prerequisite.Type.Attribute:
                return (
                    state.attributes[prerequisite.attribute] >=
                    (prerequisite.value ?? 1)
                );
            default:
                return true;
        }
    });

    return met;
}

/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
