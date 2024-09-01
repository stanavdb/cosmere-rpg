export interface ItemContextOptions {
    showEquippedHand?: boolean;
}

export interface ItemContext {
    subtitle: string;

    hasDescription: boolean;
    descriptionHTML?: string;

    isPhysical: boolean;
    quantity: number;
    weight: Partial<{
        value: number;
        unit: string;
    }>;
    price: Partial<{
        value: number;
        unit: string;
    }>;

    isEquippable: boolean;
    equipped: boolean;
    equip: Partial<{
        type: string;
        typeLabel: string;
        typeIcon: string;
        hold: string;
        holdLabel: string;
        holdIcon: string;
    }>;

    hasSkillTest: boolean;
    skillTest: Partial<{
        skill: string;
        skillLabel: string;
        usesDefaultAttribute: boolean;

        attribute: string;
        attributeLabel: string;
        attributeLabelShort: string;
    }>;

    hasActivation: boolean;
    activation: Partial<{
        hasCost: boolean;
        cost: Partial<{
            type: string;
            typeLabel: string;
            value: number;
        }>;
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
        resourceHasRecharge: boolean;
        resourceRecharge: string;
        resourceRechargeLabel: string;
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
