export interface ItemContext {
    subtitle: string;

    hasSkillTest: boolean;
    skillTest: Partial<{
        skill: string;
        skillLabel: string;
        usesDefaultAttribute: boolean;

        attribute: string;
        attributeLabel: string;
        attributeLabelShort: string;
    }>;

    hasConsume: boolean;
    consume: Partial<{
        type: string;
        value: number;
        consumesActorResource: boolean;
        consumesItemResource: boolean;
        consumesItem: boolean;

        resource: string;
        resourceLabel: string;
    }>;

    hasResources: boolean;
    resources: Partial<{
        id: string;
        label: string;
        labelPlural: string;
        value: number;
        hasMax: boolean;
        max: number;

        hasRecharge: boolean;
        recharge?: string;
        rechargeLabel?: string;
    }>[];

    hasDamage: boolean;
    damage: Partial<{
        formula: string;
        formulaData: object;
        hasSkill: boolean;
        hasAttribute: boolean;

        skill: string;
        skillLabel: string;
        usesDefaultAttribute: boolean;

        attribute: string;
        attributeLabel: string;
        attributeLabelShort: string;

        type: string;
        typeLabel: string;
    }>;
}
