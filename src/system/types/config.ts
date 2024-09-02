import {
    Size,
    CreatureType,
    Condition,
    InjuryDuration,
    AttributeGroup,
    Attribute,
    Skill,
    Resource,
    WeaponType,
    WeaponId,
    ArmorId,
    ExpertiseType,
    WeaponTraitId,
    ArmorTraitId,
    AdversaryRole,
    DeflectSource,
    ActivationType,
    ItemConsumeType,
    ActionType,
    ActionCostType,
    AttackType,
    DamageType,
    ItemType,
    ItemRechargeType,
    ItemResource,
    EquipType,
    HoldType,
    EquipHand,
    PathType,
} from './cosmere';

export interface SizeConfig {
    label: string;
    size?: number;
    unit?: string;
}

export interface CreatureTypeConfig {
    label: string;
}

export interface ConditionConfig {
    label: string;
    reference?: string;
}

export interface InjuryConfig {
    label: string;
    durationFormula?: string;
}

export interface AttributeGroupConfig {
    key: string;
    label: string;
    attributes: [Attribute, Attribute];
    resource: Resource;
}

export interface AttributeConfig {
    key: string;
    label: string;
    labelShort: string;
    skills: Skill[];
}

export interface SkillConfig {
    key: string;
    label: string;
    attribute: Attribute;
    attrLabel: string;
    hiddenUntilAcquired?: boolean;
}

export interface ResourceConfig {
    key: string;
    label: string;
    deflect?: boolean;
}

export interface PathTypeConfig {
    label: string;
}

export interface CurrencyConfig {
    label: string;
    denominations: {
        primary: CurrencyDenominationConfig[];
        secondary?: CurrencyDenominationConfig[];
    };
}

export interface CurrencyDenominationConfig {
    id: string;
    label: string;
    conversionRate: number; // Value relative to base denomination
    base?: boolean; // Present if this denomination is considered the base
}

export interface WeaponTypeConfig {
    label: string;
}

export interface WeaponConfig {
    reference: string;
    specialExpertise?: boolean;
}

export interface ArmorConfig {
    reference: string;
    specialExpertise?: boolean;
}

export interface ExpertiseTypeConfig {
    label: string;
    icon?: string;
}

export interface TraitConfig {
    label: string;
    reference?: string;
    hasValue?: boolean;
}

export interface AdversaryRoleConfig {
    label: string;
}

export interface DeflectSourceConfig {
    label: string;
}

export interface ActivationTypeConfig {
    label: string;
}

export interface ItemResourceConfig {
    label: string;
    labelPlural: string;
}

export interface ItemConsumeTypeConfig {
    label: string;
}

export interface ItemRechargeConfig {
    label: string;
}

export interface ActionTypeConfig {
    label: string;
    labelPlural: string;
    subtitle?: string;
    hasMode?: boolean;
}

export interface ActionCostConfig {
    label: string;
    icon?: string;
}

export interface AttackTypeConfig {
    label: string;
}

export interface DamageTypeConfig {
    label: string;
    icon?: string;
    ignoreDeflect?: boolean;
}

export interface ItemTypeConfig {
    label: string;
    labelPlural: string;
}

export interface EquipTypeConfig {
    label: string;
}

export interface HoldTypeConfig {
    label: string;
}

export interface EquipHandConfig {
    label: string;
}

export interface CosmereRPGConfig {
    sizes: Record<Size, SizeConfig>;
    creatureTypes: Record<CreatureType, CreatureTypeConfig>;
    conditions: Record<Condition, ConditionConfig>;
    injuries: Record<InjuryDuration, InjuryConfig>;

    attributeGroups: Record<AttributeGroup, AttributeGroupConfig>;
    attributes: Record<Attribute, AttributeConfig>;
    resources: Record<Resource, ResourceConfig>;
    skills: Record<Skill, SkillConfig>;
    currencies: Record<string, CurrencyConfig>;

    paths: {
        types: Record<PathType, PathTypeConfig>;
    };

    items: {
        types: Record<ItemType, ItemTypeConfig>;
        activation: {
            types: Record<ActivationType, ActivationTypeConfig>;
            consumeTypes: Record<ItemConsumeType, ItemConsumeTypeConfig>;
        };
        resources: {
            types: Record<ItemResource, ItemResourceConfig>;
            recharge: Record<ItemRechargeType, ItemRechargeConfig>;
        };
        equip: {
            types: Record<EquipType, EquipTypeConfig>;
            hold: Record<HoldType, HoldTypeConfig>;
            hand: Record<EquipHand, EquipHandConfig>;
        };
    };

    weaponTypes: Record<WeaponType, WeaponTypeConfig>;
    weapons: Record<WeaponId, WeaponConfig>;
    armors: Record<ArmorId, ArmorConfig>;
    expertiseTypes: Record<ExpertiseType, ExpertiseTypeConfig>;

    traits: {
        weaponTraits: Record<WeaponTraitId, TraitConfig>;
        armorTraits: Record<ArmorTraitId, TraitConfig>;
    };

    adversary: {
        roles: Record<AdversaryRole, AdversaryRoleConfig>;
    };

    deflect: {
        sources: Record<DeflectSource, DeflectSourceConfig>;
    };

    action: {
        types: Record<ActionType, ActionTypeConfig>;
        costs: Record<ActionCostType, ActionCostConfig>;
    };

    attack: {
        types: Record<AttackType, AttackTypeConfig>;
    };

    damageTypes: Record<DamageType, DamageTypeConfig>;
}
