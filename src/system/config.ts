// Types
import { CosmereRPGConfig } from './types/config';
import { 
    Attribute, 
    AttributeGroup, 
    Resource, 
    Skill, 


    ActionCostType,
    DamageType
} from './types/cosmere';

const COSMERE: CosmereRPGConfig = {
    attributeGroups: {
        [AttributeGroup.Physical]: {
            label: 'Physical',
            attributes: [
                Attribute.Strength,
                Attribute.Speed
            ],
            resource: Resource.Health
        },
        [AttributeGroup.Cognitive]: {
            label: 'Cognitive',
            attributes: [
                Attribute.Intellect,
                Attribute.Willpower
            ],
            resource: Resource.Focus
        },
        [AttributeGroup.Spiritual]: {
            label: 'Spiritual',
            attributes: [
                Attribute.Awareness,
                Attribute.Presence
            ],
            resource: Resource.Investiture
        }
    },

    attributes: {
        [Attribute.Strength]: {
            label: 'Strength',
            skills: [
                Skill.Athletics,
                Skill.HeavyWeapons
            ]
        },
        [Attribute.Speed]: {
            label: 'Speed',
            skills: [
                Skill.Agility,
                Skill.LightWeapons,
                Skill.Stealth,
                Skill.Thievery
            ]
        },
        [Attribute.Intellect]: {
            label: 'Intellect',
            skills: [
                Skill.Crafting,
                Skill.Deduction,
                Skill.Lore,
                Skill.Medicine
            ]
        },
        [Attribute.Willpower]: {
            label: 'Willpower',
            skills: [
                Skill.Discipline,
                Skill.Intimidation,

                Skill.Transformation
            ]
        },
        [Attribute.Awareness]: {
            label: 'Awareness',
            skills: [
                Skill.Insight,
                Skill.Perception,
                Skill.Survival,

                Skill.Gravitation
            ]
        },
        [Attribute.Presence]: {
            label: 'Presence',
            skills: [
                Skill.Deception,
                Skill.Leadership,
                Skill.Persuasion,

                Skill.Adhesion,
                Skill.Illumination,
            ]
        }
    },

    resources: {
        [Resource.Health]: {
            label: 'Health',
            deflect: true
        },
        [Resource.Focus]: {
            label: 'Focus'
        },
        [Resource.Investiture]: {
            label: 'Investiture'
        }
    },

    skills: {
        [Skill.Agility]: {
            label: 'Agility',
            attribute: Attribute.Speed
        },
        [Skill.Athletics]: {
            label: 'Athletics',
            attribute: Attribute.Strength
        },
        [Skill.HeavyWeapons]: {
            label: 'Heavy Weapons',
            attribute: Attribute.Strength
        },
        [Skill.LightWeapons]: {
            label: 'Light Weapons',
            attribute: Attribute.Speed
        },
        [Skill.Stealth]: {
            label: 'Stealth',
            attribute: Attribute.Speed
        },
        [Skill.Thievery]: {
            label: 'Thievery',
            attribute: Attribute.Speed
        },

        [Skill.Crafting]: {
            label: 'Crafting',
            attribute: Attribute.Intellect
        },
        [Skill.Deduction]: {
            label: 'Deduction',
            attribute: Attribute.Intellect
        },
        [Skill.Discipline]: {
            label: 'Discipline',
            attribute: Attribute.Willpower
        },
        [Skill.Intimidation]: {
            label: 'Intimidation',
            attribute: Attribute.Willpower
        },
        [Skill.Lore]: {
            label: 'Lore',
            attribute: Attribute.Intellect
        },
        [Skill.Medicine]: {
            label: 'Medicine',
            attribute: Attribute.Intellect
        },

        [Skill.Deception]: {
            label: 'Deception',
            attribute: Attribute.Presence
        },
        [Skill.Insight]: {
            label: 'Insight',
            attribute: Attribute.Awareness
        },
        [Skill.Leadership]: {
            label: 'Leadership',
            attribute: Attribute.Presence
        },
        [Skill.Perception]: {
            label: 'Perception',
            attribute: Attribute.Awareness
        },
        [Skill.Persuasion]: {
            label: 'Persuasion',
            attribute: Attribute.Presence
        },
        [Skill.Survival]: {
            label: 'Survival',
            attribute: Attribute.Awareness
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
        }
    },

    actionCosts: {
        [ActionCostType.Action]: {
            label: 'Action'
        },
        [ActionCostType.Reaction]: {
            label: 'Reaction'
        },
        [ActionCostType.FreeAction]: {
            label: 'Free action'
        }
    },
    
    damageTypes: {
        [DamageType.Energy]: {
            label: 'Energy',
        },
        [DamageType.Impact]: {
            label: 'Impact'
        },
        [DamageType.Keen]: {
            label: 'Keen'
        },
        [DamageType.Spirit]: {
            label: 'Spirit',
            ignoreDeflect: true
        },
        [DamageType.Vital]: {
            label: 'Vital',
            ignoreDeflect: true
        }
    }
};

export default COSMERE;