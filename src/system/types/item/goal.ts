import { Skill } from '../cosmere';

export namespace Reward {
    export const enum Type {
        SkillRanks = 'skill-ranks',
        Items = 'items',
    }
}

interface BaseReward<Type extends Reward.Type> {
    type: Type;
}

export interface SkillRanksReward extends BaseReward<Reward.Type.SkillRanks> {
    /**
     * The Skill of which ranks are being granted
     */
    skill: Skill;

    /**
     * The number of ranks being granted
     */
    ranks: number;
}

export interface ItemsReward extends BaseReward<Reward.Type.Items> {
    /**
     * The UUIDs of the items being granted
     */
    items: string[];
}

export type Reward = SkillRanksReward | ItemsReward;
