import { AttributeGroup, Attribute, Skill, Resource } from './cosmere';

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

export interface CosmereRPGConfig {
    attributeGroups: Record<AttributeGroup, AttributeGroupConfig>;
    attributes: Record<Attribute, AttributeConfig>;
    resources: Record<Resource, ResourceConfig>;
    skills: Record<Skill, SkillConfig>;
}