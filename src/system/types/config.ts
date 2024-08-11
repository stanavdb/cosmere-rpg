import { 
    AttributeGroup, 
    Attribute, 
    Skill, 
    Resource, 

    WeaponType,
    WeaponId,
    ArmorId,
    ExpertiseType,

    ActionCostType,
    DamageType 
} from './cosmere';

export interface AttributeGroupConfig {
    label: string;
    attributes: [ Attribute, Attribute ];
    resource: Resource;
}

export interface AttributeConfig {
    label: string;
    skills: Skill[];
}

export interface SkillConfig {
    label: string;
    attribute: Attribute;
    hiddenUntilAquired?: boolean;
}

export interface ResourceConfig {
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
    attributeGroups: Record<AttributeGroup, AttributeGroupConfig>;
    attributes: Record<Attribute, AttributeConfig>;
    resources: Record<Resource, ResourceConfig>;
    skills: Record<Skill, SkillConfig>;

    weaponTypes: Record<WeaponType, WeaponTypeConfig>;
    weaponIds: Record<WeaponId, WeaponConfig>;
    armorIds: Record<ArmorId, ArmorConfig>;

    expertiseTypes: Record<ExpertiseType, ExpertiseTypeConfig>;

    actionCosts: Record<ActionCostType, ActionCostConfig>;
    damageTypes: Record<DamageType, DamageTypeConfig>;
}