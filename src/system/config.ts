// Types
import { CosmereRPGConfig } from './types/config';
import { 
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

    ActionCostType,
    DamageType
} from './types/cosmere';


const COSMERE: CosmereRPGConfig = {
    attributeGroups: {
        [AttributeGroup.Physical]: {
            label: 'COSMERE.AttributeGroup.Physical.long',
            attributes: [
                Attribute.Strength,
                Attribute.Speed
            ],
            resource: Resource.Health
        },
        [AttributeGroup.Cognitive]: {
            label: 'COSMERE.AttributeGroup.Cognitive.long',
            attributes: [
                Attribute.Intellect,
                Attribute.Willpower
            ],
            resource: Resource.Focus
        },
        [AttributeGroup.Spiritual]: {
            label: 'COSMERE.AttributeGroup.Spiritual.long',
            attributes: [
                Attribute.Awareness,
                Attribute.Presence
            ],
            resource: Resource.Investiture
        }
    },

    attributes: {
        [Attribute.Strength]: {
            label: 'COSMERE.Attribute.Strength.long',
            skills: [
                Skill.Athletics,
                Skill.HeavyWeapons
            ]
        },
        [Attribute.Speed]: {
            label: 'COSMERE.Attribute.Speed.long',
            skills: [
                Skill.Agility,
                Skill.LightWeapons,
                Skill.Stealth,
                Skill.Thievery
            ]
        },
        [Attribute.Intellect]: {
            label: 'COSMERE.Attribute.Intellect.long',
            skills: [
                Skill.Crafting,
                Skill.Deduction,
                Skill.Lore,
                Skill.Medicine
            ]
        },
        [Attribute.Willpower]: {
            label: 'COSMERE.Attribute.Willpower.long',
            skills: [
                Skill.Discipline,
                Skill.Intimidation,

                Skill.Transformation
            ]
        },
        [Attribute.Awareness]: {
            label: 'COSMERE.Attribute.Awareness.long',
            skills: [
                Skill.Insight,
                Skill.Perception,
                Skill.Survival,

                Skill.Gravitation
            ]
        },
        [Attribute.Presence]: {
            label: 'COSMERE.Attribute.Presence.long',
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
            label: 'COSMERE.Resource.Health',
            deflect: true
        },
        [Resource.Focus]: {
            label: 'COSMERE.Resource.Focus'
        },
        [Resource.Investiture]: {
            label: 'COSMERE.Resource.Investiture'
        }
    },

    skills: {
        [Skill.Agility]: {
            label: 'COSMERE.Skill.Agility',
            attribute: Attribute.Speed
        },
        [Skill.Athletics]: {
            label: 'COSMERE.Skill.Athletics',
            attribute: Attribute.Strength
        },
        [Skill.HeavyWeapons]: {
            label: 'COSMERE.Skill.HeavyWeapons',
            attribute: Attribute.Strength
        },
        [Skill.LightWeapons]: {
            label: 'COSMERE.Skill.LightWeapons',
            attribute: Attribute.Speed
        },
        [Skill.Stealth]: {
            label: 'COSMERE.Skill.Stealth',
            attribute: Attribute.Speed
        },
        [Skill.Thievery]: {
            label: 'COSMERE.Skill.Thievery',
            attribute: Attribute.Speed
        },

        [Skill.Crafting]: {
            label: 'COSMERE.Skill.Crafting',
            attribute: Attribute.Intellect
        },
        [Skill.Deduction]: {
            label: 'COSMERE.Skill.Deduction',
            attribute: Attribute.Intellect
        },
        [Skill.Discipline]: {
            label: 'COSMERE.Skill.Discipline',
            attribute: Attribute.Willpower
        },
        [Skill.Intimidation]: {
            label: 'COSMERE.Skill.Intimidation',
            attribute: Attribute.Willpower
        },
        [Skill.Lore]: {
            label: 'COSMERE.Skill.Lore',
            attribute: Attribute.Intellect
        },
        [Skill.Medicine]: {
            label: 'COSMERE.Skill.Medicine',
            attribute: Attribute.Intellect
        },

        [Skill.Deception]: {
            label: 'COSMERE.Skill.Deception',
            attribute: Attribute.Presence
        },
        [Skill.Insight]: {
            label: 'COSMERE.Skill.Insight',
            attribute: Attribute.Awareness
        },
        [Skill.Leadership]: {
            label: 'COSMERE.Skill.Leadership',
            attribute: Attribute.Presence
        },
        [Skill.Perception]: {
            label: 'COSMERE.Skill.Perception',
            attribute: Attribute.Awareness
        },
        [Skill.Persuasion]: {
            label: 'COSMERE.Skill.Persuasion',
            attribute: Attribute.Presence
        },
        [Skill.Survival]: {
            label: 'COSMERE.Skill.Survival',
            attribute: Attribute.Awareness
        },

        // Surges,
        [Skill.Adhesion]: {
            label: 'COSMERE.Skill.Adhesion',
            attribute: Attribute.Presence,
            hiddenUntilAcquired: true,
        },
        [Skill.Gravitation]: {
            label: 'COSMERE.Skill.Gravitation',
            attribute: Attribute.Awareness,
            hiddenUntilAcquired: true,
        },
        [Skill.Illumination]: {
            label: 'COSMERE.Skill.Illumination',
            attribute: Attribute.Presence,
            hiddenUntilAcquired: true,
        },
        [Skill.Transformation]: {
            label: 'COSMERE.Skill.Transformation',
            attribute: Attribute.Willpower,
            hiddenUntilAcquired: true,
        }
    },

    weaponTypes: {
        [WeaponType.Light]: {
            label: 'COSMERE.WeaponType.Light'
        },
        [WeaponType.Heavy]: {
            label: 'COSMERE.WeaponType.Heavy'
        },
        [WeaponType.Special]: {
            label: 'COSMERE.WeaponType.Special'
        }
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
            specialExpertise: true 
        }
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
            specialExpertise: true
        }
    },

    expertiseTypes: {
        [ExpertiseType.Armor]: {
            label: 'COSMERE.Expertise.Armor'
        },
        [ExpertiseType.Cultural]: {
            label: 'COSMERE.Expertise.Cultural'
        },
        [ExpertiseType.Specialist]: {
            label: 'COSMERE.Expertise.Specialist'
        },
        [ExpertiseType.Utility]: {
            label: 'COSMERE.Expertise.Utility'
        },
        [ExpertiseType.Weapon]: {
            label: 'COSMERE.Expertise.Weapon'
        }
    },

    traits: {
        weaponTraits: {
            [WeaponTraitId.Cumbersome]: {
                label: 'COSMERE.WeaponTrait.Cumbersome',
                hasValue: true
            },
            [WeaponTraitId.Dangerous]: {
                label: 'COSMERE.WeaponTrait.Dangerous'
            },
            [WeaponTraitId.Deadly]: {
                label: 'COSMERE.WeaponTrait.Deadly'
            },
            [WeaponTraitId.Defensive]: {
                label: 'COSMERE.WeaponTrait.Defensive'
            },
            [WeaponTraitId.Discreet]: {
                label: 'COSMERE.WeaponTrait.Discreet'
            },
            [WeaponTraitId.Indirect]: {
                label: 'COSMERE.WeaponTrait.Indirect'
            },
            [WeaponTraitId.Loaded]: {
                label: 'COSMERE.WeaponTrait.Loaded',
                hasValue: true
            },
            [WeaponTraitId.Momentum]: {
                label: 'COSMERE.WeaponTrait.Momentum'
            },
            [WeaponTraitId.Offhand]: {
                label: 'COSMERE.WeaponTrait.Offhand'
            },
            [WeaponTraitId.Pierce]: {
                label: 'COSMERE.WeaponTrait.Pierce'
            },
            [WeaponTraitId.Quickdraw]: {
                label: 'COSMERE.WeaponTrait.Quickdraw'
            },
            [WeaponTraitId.Thrown]: {
                label: 'COSMERE.WeaponTrait.Thrown'
            },
            [WeaponTraitId.TwoHanded]: {
                label: 'COSMERE.WeaponTrait.TwoHanded'
            },
            [WeaponTraitId.Unique]: {
                label: 'COSMERE.WeaponTrait.Unique'
            },
            [WeaponTraitId.Fragile]: {
                label: 'COSMERE.WeaponTrait.Fragile'
            }
        },

        armorTraits: {
            [ArmorTraitId.Cumbersome]: {
                label: 'COSMERE.ArmorTrait.Cumbersome',
                hasValue: true
            },
            [ArmorTraitId.Dangerous]: {
                label: 'COSMERE.ArmorTrait.Dangerous'
            },
            [ArmorTraitId.Presentable]: {
                label: 'COSMERE.ArmorTrait.Presentable'
            }
        }
    },

    actionCosts: {
        [ActionCostType.Action]: {
            label: 'COSMERE.ActionCosts.Action'
        },
        [ActionCostType.Reaction]: {
            label: 'COSMERE.ActionCosts.Reaction'
        },
        [ActionCostType.FreeAction]: {
            label: 'COSMERE.ActionCosts.FreeAction'
        }
    },
    
    damageTypes: {
        [DamageType.Energy]: {
            label: 'COSMERE.DamageTypes.Energy',
        },
        [DamageType.Impact]: {
            label: 'COSMERE.DamageTypes.Impact'
        },
        [DamageType.Keen]: {
            label: 'COSMERE.DamageTypes.Keen'
        },
        [DamageType.Spirit]: {
            label: 'COSMERE.DamageTypes.Spirit',
            ignoreDeflect: true
        },
        [DamageType.Vital]: {
            label: 'COSMERE.DamageTypes.Vital',
            ignoreDeflect: true
        }
    }
};

export default COSMERE;