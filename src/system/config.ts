// Types
import { CosmereRPGConfig } from './types/config';
import {
    Size,
    CreatureType,
    Condition,
    Attribute,
    AttributeGroup,
    Resource,
    Skill,
    WeaponType,
    WeaponId,
    ArmorId,
    ExpertiseType,
    WeaponTraitId,
    ArmorTraitId,
    AdversaryRole,
    DeflectSource,
    ActionCostType,
    DamageType,
} from './types/cosmere';

const COSMERE: CosmereRPGConfig = {
    sizes: {
        [Size.Small]: {
            label: 'Small',
            size: 2.5,
            unit: 'feet',
        },
        [Size.Medium]: {
            label: 'Medium',
            size: 5,
            unit: 'feet',
        },
        [Size.Large]: {
            label: 'Large',
            size: 10,
            unit: 'feet',
        },
        [Size.Huge]: {
            label: 'Huge',
            size: 15,
            unit: 'feet',
        },
        [Size.Garguantuan]: {
            label: 'Gargantuan',
            size: 20,
            unit: 'feet',
        },
    },
    creatureTypes: {
        [CreatureType.Humanoid]: {
            label: 'Humanoid',
        },
        [CreatureType.Animal]: {
            label: 'Animal',
        },
        [CreatureType.Spren]: {
            label: 'Spren',
        },
    },

    conditions: {
        [Condition.Afflicted]: {
            label: 'Afflicted',
        },
        [Condition.Determined]: {
            label: 'Determined',
        },
        [Condition.Disoriented]: {
            label: 'Disoriented',
        },
        [Condition.Empowered]: {
            label: 'Empowered',
        },
        [Condition.Enhanced]: {
            label: 'Enhanced',
        },
        [Condition.Exhausted]: {
            label: 'Exhausted',
        },
        [Condition.Focused]: {
            label: 'Focused',
        },
        [Condition.Immobilized]: {
            label: 'Immobilized',
        },
        [Condition.Prone]: {
            label: 'Prone',
        },
        [Condition.Restrained]: {
            label: 'Restrained',
        },
        [Condition.Slowed]: {
            label: 'Slowed',
        },
        [Condition.Stunned]: {
            label: 'Stunned',
        },
        [Condition.Surprised]: {
            label: 'Surprised',
        },
        [Condition.Unconcious]: {
            label: 'Unconcious',
        },
    },

    attributeGroups: {
        [AttributeGroup.Physical]: {
            label: 'Physical',
            attributes: [Attribute.Strength, Attribute.Speed],
            resource: Resource.Health,
        },
        [AttributeGroup.Cognitive]: {
            label: 'Cognitive',
            attributes: [Attribute.Intellect, Attribute.Willpower],
            resource: Resource.Focus,
        },
        [AttributeGroup.Spiritual]: {
            label: 'Spiritual',
            attributes: [Attribute.Awareness, Attribute.Presence],
            resource: Resource.Investiture,
        },
    },

    attributes: {
        [Attribute.Strength]: {
            label: 'Strength',
            skills: [Skill.Athletics, Skill.HeavyWeapons],
        },
        [Attribute.Speed]: {
            label: 'Speed',
            skills: [
                Skill.Agility,
                Skill.LightWeapons,
                Skill.Stealth,
                Skill.Thievery,
            ],
        },
        [Attribute.Intellect]: {
            label: 'Intellect',
            skills: [
                Skill.Crafting,
                Skill.Deduction,
                Skill.Lore,
                Skill.Medicine,
            ],
        },
        [Attribute.Willpower]: {
            label: 'Willpower',
            skills: [
                Skill.Discipline,
                Skill.Intimidation,
                Skill.Transformation,
            ],
        },
        [Attribute.Awareness]: {
            label: 'Awareness',
            skills: [
                Skill.Insight,
                Skill.Perception,
                Skill.Survival,

                Skill.Gravitation,
            ],
        },
        [Attribute.Presence]: {
            label: 'Presence',
            skills: [
                Skill.Deception,
                Skill.Leadership,
                Skill.Persuasion,

                Skill.Adhesion,
                Skill.Illumination,
            ],
        },
    },

    resources: {
        [Resource.Health]: {
            label: 'Health',
            deflect: true,
        },
        [Resource.Focus]: {
            label: 'Focus',
        },
        [Resource.Investiture]: {
            label: 'Investiture',
        },
    },

    skills: {
        [Skill.Agility]: {
            label: 'Agility',
            attribute: Attribute.Speed,
        },
        [Skill.Athletics]: {
            label: 'Athletics',
            attribute: Attribute.Strength,
        },
        [Skill.HeavyWeapons]: {
            label: 'Heavy Weapons',
            attribute: Attribute.Strength,
        },
        [Skill.LightWeapons]: {
            label: 'Light Weapons',
            attribute: Attribute.Speed,
        },
        [Skill.Stealth]: {
            label: 'Stealth',
            attribute: Attribute.Speed,
        },
        [Skill.Thievery]: {
            label: 'Thievery',
            attribute: Attribute.Speed,
        },

        [Skill.Crafting]: {
            label: 'Crafting',
            attribute: Attribute.Intellect,
        },
        [Skill.Deduction]: {
            label: 'Deduction',
            attribute: Attribute.Intellect,
        },
        [Skill.Discipline]: {
            label: 'Discipline',
            attribute: Attribute.Willpower,
        },
        [Skill.Intimidation]: {
            label: 'Intimidation',
            attribute: Attribute.Willpower,
        },
        [Skill.Lore]: {
            label: 'Lore',
            attribute: Attribute.Intellect,
        },
        [Skill.Medicine]: {
            label: 'Medicine',
            attribute: Attribute.Intellect,
        },

        [Skill.Deception]: {
            label: 'Deception',
            attribute: Attribute.Presence,
        },
        [Skill.Insight]: {
            label: 'Insight',
            attribute: Attribute.Awareness,
        },
        [Skill.Leadership]: {
            label: 'Leadership',
            attribute: Attribute.Presence,
        },
        [Skill.Perception]: {
            label: 'Perception',
            attribute: Attribute.Awareness,
        },
        [Skill.Persuasion]: {
            label: 'Persuasion',
            attribute: Attribute.Presence,
        },
        [Skill.Survival]: {
            label: 'Survival',
            attribute: Attribute.Awareness,
        },

        // Surges,
        [Skill.Adhesion]: {
            label: 'Adhesion',
            attribute: Attribute.Presence,
            hiddenUntilAquired: true,
        },
        [Skill.Gravitation]: {
            label: 'Gravitation',
            attribute: Attribute.Awareness,
            hiddenUntilAquired: true,
        },
        [Skill.Illumination]: {
            label: 'Illumination',
            attribute: Attribute.Presence,
            hiddenUntilAquired: true,
        },
        [Skill.Transformation]: {
            label: 'Transformation',
            attribute: Attribute.Willpower,
            hiddenUntilAquired: true,
        },
    },

    weaponTypes: {
        [WeaponType.Light]: {
            label: 'Light',
        },
        [WeaponType.Heavy]: {
            label: 'Heavy',
        },
        [WeaponType.Special]: {
            label: 'Special',
        },
    },

    // TODO: These should reference their respective item ids in the compendium
    weapons: {
        [WeaponId.Javelin]: { reference: '' },
        [WeaponId.Knife]: { reference: '' },
        [WeaponId.Mace]: { reference: '' },
        [WeaponId.Rapier]: { reference: '' },
        [WeaponId.Shortspear]: { reference: '' },
        [WeaponId.Sidesword]: { reference: '' },
        [WeaponId.Staff]: { reference: '' },
        [WeaponId.Shortbow]: { reference: '' },
        [WeaponId.Sling]: { reference: '' },

        [WeaponId.Axe]: { reference: '' },
        [WeaponId.Greatsword]: { reference: '' },
        [WeaponId.Hammer]: { reference: '' },
        [WeaponId.Longspear]: { reference: '' },
        [WeaponId.Longsword]: { reference: '' },
        [WeaponId.Poleaxe]: { reference: '' },
        [WeaponId.Shield]: { reference: '' },
        [WeaponId.Crossbow]: { reference: '' },
        [WeaponId.Longbow]: { reference: '' },

        [WeaponId.Improvised]: { reference: '' },
        [WeaponId.Unarmed]: { reference: '' },
        [WeaponId.Shardblade]: {
            reference: '',
            specialExpertise: true,
        },
    },

    // TODO: These should reference their respective item ids in the compendium
    armors: {
        [ArmorId.Uniform]: { reference: '' },
        [ArmorId.Leather]: { reference: '' },
        [ArmorId.Chain]: { reference: '' },
        [ArmorId.Breastplate]: { reference: '' },
        [ArmorId.HalfPlate]: { reference: '' },
        [ArmorId.FullPlate]: { reference: '' },
        [ArmorId.Shardplate]: {
            reference: '',
            specialExpertise: true,
        },
    },

    expertiseTypes: {
        [ExpertiseType.Armor]: {
            label: 'Armor',
        },
        [ExpertiseType.Cultural]: {
            label: 'Cultural',
        },
        [ExpertiseType.Specialist]: {
            label: 'Specialist',
        },
        [ExpertiseType.Utility]: {
            label: 'Utility',
        },
        [ExpertiseType.Weapon]: {
            label: 'Weapon',
        },
    },

    traits: {
        weaponTraits: {
            [WeaponTraitId.Cumbersome]: {
                label: 'Cumbersome',
                hasValue: true,
            },
            [WeaponTraitId.Dangerous]: {
                label: 'Dangerous',
            },
            [WeaponTraitId.Deadly]: {
                label: 'Deadly',
            },
            [WeaponTraitId.Defensive]: {
                label: 'Defensive',
            },
            [WeaponTraitId.Discreet]: {
                label: 'Discreet',
            },
            [WeaponTraitId.Indirect]: {
                label: 'Indirect',
            },
            [WeaponTraitId.Loaded]: {
                label: 'Loaded',
                hasValue: true,
            },
            [WeaponTraitId.Momentum]: {
                label: 'Momentum',
            },
            [WeaponTraitId.Offhand]: {
                label: 'Offhand',
            },
            [WeaponTraitId.Pierce]: {
                label: 'Pierce',
            },
            [WeaponTraitId.Quickdraw]: {
                label: 'Quickdraw',
            },
            [WeaponTraitId.Thrown]: {
                label: 'Thrown',
            },
            [WeaponTraitId.TwoHanded]: {
                label: 'Two-Handed',
            },
            [WeaponTraitId.Unique]: {
                label: 'Unique',
            },
            [WeaponTraitId.Fragile]: {
                label: 'Fragile',
            },
        },

        armorTraits: {
            [ArmorTraitId.Cumbersome]: {
                label: 'Cumbersome',
                hasValue: true,
            },
            [ArmorTraitId.Dangerous]: {
                label: 'Dangerous',
            },
            [ArmorTraitId.Presentable]: {
                label: 'Presentable',
            },
        },
    },

    adversary: {
        roles: {
            [AdversaryRole.Minion]: {
                label: 'Minion',
            },
            [AdversaryRole.Rival]: {
                label: 'Rival',
            },
            [AdversaryRole.Boss]: {
                label: 'Boss',
            },
        },
    },

    deflect: {
        sources: {
            [DeflectSource.None]: {
                label: 'None',
            },
            [DeflectSource.Armor]: {
                label: 'Armor',
            },
        },
    },

    actionCosts: {
        [ActionCostType.Action]: {
            label: 'Action',
        },
        [ActionCostType.Reaction]: {
            label: 'Reaction',
        },
        [ActionCostType.FreeAction]: {
            label: 'Free action',
        },
    },

    damageTypes: {
        [DamageType.Energy]: {
            label: 'Energy',
        },
        [DamageType.Impact]: {
            label: 'Impact',
        },
        [DamageType.Keen]: {
            label: 'Keen',
        },
        [DamageType.Spirit]: {
            label: 'Spirit',
            ignoreDeflect: true,
        },
        [DamageType.Vital]: {
            label: 'Vital',
            ignoreDeflect: true,
        },
    },
};

export default COSMERE;
