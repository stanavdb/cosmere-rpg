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
    ActionCostType,
    DamageType,
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

export interface ItemConsumeTypeConfig {
    label: string;
}

export interface ActionCostConfig {
    label: string;
    icon?: string;
}

export interface DamageTypeConfig {
    label: string;
    icon?: string;
    ignoreDeflect?: boolean;
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

    items: {
        activation: {
            types: Record<ActivationType, ActivationTypeConfig>;
            consumeTypes: Record<ItemConsumeType, ItemConsumeTypeConfig>;
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

    actionCosts: Record<ActionCostType, ActionCostConfig>;
    damageTypes: Record<DamageType, DamageTypeConfig>;
}
