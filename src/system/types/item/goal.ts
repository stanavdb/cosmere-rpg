import { Skill } from '../cosmere';

export const enum GrantType {
    SkillRanks = 'skill-ranks',
    Power = 'power',
}

interface BaseGrantRule<Type extends GrantType> {
    type: Type;
}

export interface SkillRanksGrantRule
    extends BaseGrantRule<GrantType.SkillRanks> {
    /**
     * The Skill being granted
     */
    skill: Skill;

    /**
     * The number of ranks being granted
     */
    ranks: number;
}

export interface PowerGrantRule extends BaseGrantRule<GrantType.Power> {
    /**
     * The UUID of the Power Item being granted
     */
    power: string;
}

export type GrantRule = SkillRanksGrantRule | PowerGrantRule;
