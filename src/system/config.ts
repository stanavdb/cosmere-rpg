// Types
import { CosmereRPGConfig } from './types/config';
import {
    Size,
    CreatureType,
    Condition,
    InjuryDuration,
    Attribute,
    AttributeGroup,
    Resource,
    Skill,
    WeaponType,
    WeaponId,
    ExpertiseType,
    WeaponTraitId,
    ArmorTraitId,
    AdversaryRole,
    DeflectSource,
    ActivationType,
    ItemConsumeType,
    ActionType,
    ActionCostType,
    DamageType,
    ItemType,
    AttackType,
    ItemRechargeType,
    ItemResource,
    EquipType,
    HoldType,
    PathType,
} from './types/cosmere';

const COSMERE: CosmereRPGConfig = {
    sizes: {
        [Size.Small]: {
            label: 'COSMERE.Actor.Size.Small',
            size: 2.5,
            unit: 'feet',
        },
        [Size.Medium]: {
            label: 'COSMERE.Actor.Size.Medium',
            size: 5,
            unit: 'feet',
        },
        [Size.Large]: {
            label: 'COSMERE.Actor.Size.Large',
            size: 10,
            unit: 'feet',
        },
        [Size.Huge]: {
            label: 'COSMERE.Actor.Size.Huge',
            size: 15,
            unit: 'feet',
        },
        [Size.Garguantuan]: {
            label: 'COSMERE.Actor.Size.Gargantuan',
            size: 20,
            unit: 'feet',
        },
    },
    creatureTypes: {
        [CreatureType.Humanoid]: {
            label: 'COSMERE.Actor.Type.Humanoid',
        },
        [CreatureType.Animal]: {
            label: 'COSMERE.Actor.Type.Animal',
        },
    },

    conditions: {
        [Condition.Afflicted]: {
            label: 'COSMERE.Actor.Conditions.Afflicted',
        },
        [Condition.Determined]: {
            label: 'COSMERE.Actor.Conditions.Determined',
        },
        [Condition.Disoriented]: {
            label: 'COSMERE.Actor.Conditions.Disoriented',
        },
        [Condition.Empowered]: {
            label: 'COSMERE.Actor.Conditions.Empowered',
        },
        [Condition.Enhanced]: {
            label: 'COSMERE.Actor.Conditions.Enhanced',
        },
        [Condition.Exhausted]: {
            label: 'COSMERE.Actor.Conditions.Exhausted',
        },
        [Condition.Focused]: {
            label: 'COSMERE.Actor.Conditions.Focused',
        },
        [Condition.Immobilized]: {
            label: 'COSMERE.Actor.Conditions.Immobilized',
        },
        [Condition.Prone]: {
            label: 'COSMERE.Actor.Conditions.Prone',
        },
        [Condition.Restrained]: {
            label: 'COSMERE.Actor.Conditions.Restrained',
        },
        [Condition.Slowed]: {
            label: 'COSMERE.Actor.Conditions.Slowed',
        },
        [Condition.Stunned]: {
            label: 'COSMERE.Actor.Conditions.Stunned',
        },
        [Condition.Surprised]: {
            label: 'COSMERE.Actor.Conditions.Surprised',
        },
        [Condition.Unconcious]: {
            label: 'COSMERE.Actor.Conditions.Unconscious',
        },
    },

    injuries: {
        [InjuryDuration.FleshWound]: {
            label: 'COSMERE.Item.Injuries.Duration.FleshWound',
            durationFormula: '1',
        },
        [InjuryDuration.ShallowInjury]: {
            label: 'COSMERE.Item.Injuries.Duration.ShallowInjury',
            durationFormula: '1d6',
        },
        [InjuryDuration.ViciousInjury]: {
            label: 'COSMERE.Item.Injuries.Duration.ViciousInjury',
            durationFormula: '6d6',
        },
        [InjuryDuration.PermanentInjury]: {
            label: 'COSMERE.Item.Injuries.Duration.PermanentInjury',
        },
        [InjuryDuration.Death]: {
            label: 'COSMERE.Item.Injuries.Duration.Death',
        },
    },

    attributeGroups: {
        [AttributeGroup.Physical]: {
            key: AttributeGroup.Physical,
            label: 'COSMERE.AttributeGroup.Physical.long',
            attributes: [Attribute.Strength, Attribute.Speed],
            resource: Resource.Health,
        },
        [AttributeGroup.Cognitive]: {
            key: AttributeGroup.Cognitive,
            label: 'COSMERE.AttributeGroup.Cognitive.long',
            attributes: [Attribute.Intellect, Attribute.Willpower],
            resource: Resource.Focus,
        },
        [AttributeGroup.Spiritual]: {
            key: AttributeGroup.Spiritual,
            label: 'COSMERE.AttributeGroup.Spiritual.long',
            attributes: [Attribute.Awareness, Attribute.Presence],
            resource: Resource.Investiture,
        },
    },

    attributes: {
        [Attribute.Strength]: {
            key: Attribute.Strength,
            label: 'COSMERE.Actor.Attribute.Strength.long',
            labelShort: 'COSMERE.Actor.Attribute.Strength.short',
            skills: [Skill.Athletics, Skill.HeavyWeapons],
        },
        [Attribute.Speed]: {
            key: Attribute.Speed,
            label: 'COSMERE.Actor.Attribute.Speed.long',
            labelShort: 'COSMERE.Actor.Attribute.Speed.short',
            skills: [
                Skill.Agility,
                Skill.LightWeapons,
                Skill.Stealth,
                Skill.Thievery,
            ],
        },
        [Attribute.Intellect]: {
            key: Attribute.Intellect,
            label: 'COSMERE.Actor.Attribute.Intellect.long',
            labelShort: 'COSMERE.Actor.Attribute.Intellect.short',
            skills: [
                Skill.Crafting,
                Skill.Deduction,
                Skill.Lore,
                Skill.Medicine,
            ],
        },
        [Attribute.Willpower]: {
            key: Attribute.Willpower,
            label: 'COSMERE.Actor.Attribute.Willpower.long',
            labelShort: 'COSMERE.Actor.Attribute.Willpower.short',
            skills: [Skill.Discipline, Skill.Intimidation],
        },
        [Attribute.Awareness]: {
            key: Attribute.Awareness,
            label: 'COSMERE.Actor.Attribute.Awareness.long',
            labelShort: 'COSMERE.Actor.Attribute.Awareness.short',
            skills: [Skill.Insight, Skill.Perception, Skill.Survival],
        },
        [Attribute.Presence]: {
            key: Attribute.Presence,
            label: 'COSMERE.Actor.Attribute.Presence.long',
            labelShort: 'COSMERE.Actor.Attribute.Presence.short',
            skills: [Skill.Deception, Skill.Leadership, Skill.Persuasion],
        },
    },

    resources: {
        [Resource.Health]: {
            key: Resource.Health,
            label: 'COSMERE.Actor.Resource.Health',
            deflect: true,
        },
        [Resource.Focus]: {
            key: Resource.Health,
            label: 'COSMERE.Actor.Resource.Focus',
        },
        [Resource.Investiture]: {
            key: Resource.Health,
            label: 'COSMERE.Actor.Resource.Investiture',
        },
    },

    skills: {
        [Skill.Agility]: {
            key: Skill.Agility,
            label: 'COSMERE.Actor.Skill.Agility',
            attribute: Attribute.Speed,
            attrLabel: 'COSMERE.Actor.Attribute.Speed.short',
        },
        [Skill.Athletics]: {
            key: Skill.Athletics,
            label: 'COSMERE.Actor.Skill.Athletics',
            attribute: Attribute.Strength,
            attrLabel: 'COSMERE.Actor.Attribute.Strength.short',
        },
        [Skill.HeavyWeapons]: {
            key: Skill.HeavyWeapons,
            label: 'COSMERE.Actor.Skill.HeavyWeapons',
            attribute: Attribute.Strength,
            attrLabel: 'COSMERE.Actor.Attribute.Strength.short',
        },
        [Skill.LightWeapons]: {
            key: Skill.LightWeapons,
            label: 'COSMERE.Actor.Skill.LightWeapons',
            attribute: Attribute.Speed,
            attrLabel: 'COSMERE.Actor.Attribute.Speed.short',
        },
        [Skill.Stealth]: {
            key: Skill.Stealth,
            label: 'COSMERE.Actor.Skill.Stealth',
            attribute: Attribute.Speed,
            attrLabel: 'COSMERE.Actor.Attribute.Speed.short',
        },
        [Skill.Thievery]: {
            key: Skill.Thievery,
            label: 'COSMERE.Actor.Skill.Thievery',
            attribute: Attribute.Speed,
            attrLabel: 'COSMERE.Actor.Attribute.Speed.short',
        },

        [Skill.Crafting]: {
            key: Skill.Crafting,
            label: 'COSMERE.Actor.Skill.Crafting',
            attribute: Attribute.Intellect,
            attrLabel: 'COSMERE.Actor.Attribute.Intellect.short',
        },
        [Skill.Deduction]: {
            key: Skill.Deduction,
            label: 'COSMERE.Actor.Skill.Deduction',
            attribute: Attribute.Intellect,
            attrLabel: 'COSMERE.Actor.Attribute.Intellect.short',
        },
        [Skill.Discipline]: {
            key: Skill.Discipline,
            label: 'COSMERE.Actor.Skill.Discipline',
            attribute: Attribute.Willpower,
            attrLabel: 'COSMERE.Actor.Attribute.Willpower.short',
        },
        [Skill.Intimidation]: {
            key: Skill.Intimidation,
            label: 'COSMERE.Actor.Skill.Intimidation',
            attribute: Attribute.Willpower,
            attrLabel: 'COSMERE.Actor.Attribute.Willpower.short',
        },
        [Skill.Lore]: {
            key: Skill.Lore,
            label: 'COSMERE.Actor.Skill.Lore',
            attribute: Attribute.Intellect,
            attrLabel: 'COSMERE.Actor.Attribute.Intellect.short',
        },
        [Skill.Medicine]: {
            key: Skill.Medicine,
            label: 'COSMERE.Actor.Skill.Medicine',
            attribute: Attribute.Intellect,
            attrLabel: 'COSMERE.Actor.Attribute.Intellect.short',
        },

        [Skill.Deception]: {
            key: Skill.Deception,
            label: 'COSMERE.Actor.Skill.Deception',
            attribute: Attribute.Presence,
            attrLabel: 'COSMERE.Actor.Attribute.Presence.short',
        },
        [Skill.Insight]: {
            key: Skill.Insight,
            label: 'COSMERE.Actor.Skill.Insight',
            attribute: Attribute.Awareness,
            attrLabel: 'COSMERE.Actor.Attribute.Awareness.short',
        },
        [Skill.Leadership]: {
            key: Skill.Leadership,
            label: 'COSMERE.Actor.Skill.Leadership',
            attribute: Attribute.Presence,
            attrLabel: 'COSMERE.Actor.Attribute.Presence.short',
        },
        [Skill.Perception]: {
            key: Skill.Perception,
            label: 'COSMERE.Actor.Skill.Perception',
            attribute: Attribute.Awareness,
            attrLabel: 'COSMERE.Actor.Attribute.Awareness.short',
        },
        [Skill.Persuasion]: {
            key: Skill.Persuasion,
            label: 'COSMERE.Actor.Skill.Persuasion',
            attribute: Attribute.Presence,
            attrLabel: 'COSMERE.Actor.Attribute.Presence.short',
        },
        [Skill.Survival]: {
            key: Skill.Survival,
            label: 'COSMERE.Actor.Skill.Survival',
            attribute: Attribute.Awareness,
            attrLabel: 'COSMERE.Actor.Attribute.Awareness.short',
        },
    },

    paths: {
        types: {
            [PathType.Heroic]: {
                label: 'COSMERE.Paths.Types.Heroic.Label',
            },
        },
    },

    items: {
        types: {
            [ItemType.Weapon]: {
                label: 'COSMERE.Item.Type.Weapon.label',
                labelPlural: 'COSMERE.Item.Type.Weapon.label_plural',
            },
            [ItemType.Armor]: {
                label: 'COSMERE.Item.Type.Armor.label',
                labelPlural: 'COSMERE.Item.Type.Armor.label_plural',
            },
            [ItemType.Equipment]: {
                label: 'COSMERE.Item.Type.Equipment.label',
                labelPlural: 'COSMERE.Item.Type.Equipment.label_plural',
            },
            [ItemType.Ancestry]: {
                label: 'COSMERE.Item.Type.Ancestry.label',
                labelPlural: 'COSMERE.Item.Type.Ancestry.label_plural',
            },
            [ItemType.Path]: {
                label: 'COSMERE.Item.Type.Path.label',
                labelPlural: 'COSMERE.Item.Type.Path.label_plural',
            },
            [ItemType.Talent]: {
                label: 'COSMERE.Item.Type.Talent.label',
                labelPlural: 'COSMERE.Item.Type.Talent.label_plural',
            },
            [ItemType.Action]: {
                label: 'COSMERE.Item.Type.Action.label',
                labelPlural: 'COSMERE.Item.Type.Action.label_plural',
            },
            [ItemType.Trait]: {
                label: 'COSMERE.Item.Type.Trait.label',
                labelPlural: 'COSMERE.Item.Type.Trait.label_plural',
            },
            [ItemType.Injury]: {
                label: 'COSMERE.Item.Type.Injury.label',
                labelPlural: 'COSMERE.Item.Type.Injury.label_plural',
            },
        },
        activation: {
            types: {
                [ActivationType.Action]: {
                    label: 'COSMERE.Item.Activation.Type.Action',
                },
                [ActivationType.SkillTest]: {
                    label: 'COSMERE.Item.Activation.Type.SkillTest',
                },
                [ActivationType.Utility]: {
                    label: 'COSMERE.Item.Activation.Type.Utility',
                },
            },
            consumeTypes: {
                [ItemConsumeType.ActorResource]: {
                    label: 'COSMERE.Item.Activation.ConsumeType.ActorResource.Label',
                },
                [ItemConsumeType.ItemResource]: {
                    label: 'COSMERE.Item.Activation.ConsumeType.ItemResource.Label',
                },
                [ItemConsumeType.Item]: {
                    label: 'COSMERE.Item.Activation.ConsumeType.Item.Label',
                },
            },
        },
        resources: {
            types: {
                [ItemResource.Use]: {
                    label: 'COSMERE.Item.Resources.Use.Singular',
                    labelPlural: 'COSMERE.Item.Resources.Use.Plural',
                },
                [ItemResource.Charge]: {
                    label: 'COSMERE.Item.Resources.Charge.Singular',
                    labelPlural: 'COSMERE.Item.Resources.Charge.Plural',
                },
            },
            recharge: {
                [ItemRechargeType.PerScene]: {
                    label: 'COSMERE.Item.Resources.Recharge.PerScene',
                },
            },
        },
        equip: {
            types: {
                [EquipType.Wear]: {
                    label: 'COSMERE.Item.Equip.Types.Wear.Label',
                    icon: '<i class="fa-solid fa-shirt"></i>',
                },
                [EquipType.Hold]: {
                    label: 'COSMERE.Item.Equip.Types.Hold.Label',
                    icon: '<i class="fa-solid fa-hand-fist"></i>',
                },
            },
            hold: {
                [HoldType.MainHand]: {
                    label: 'COSMERE.Item.Equip.Hold.MainHand.Label',
                    icon: '<i class="fa-solid fa-hand"></i>',
                },
                [HoldType.OffHand]: {
                    label: 'COSMERE.Item.Equip.Hold.OffHand.Label',
                    icon: '<i class="fa-regular fa-hand"></i>',
                },
                [HoldType.TwoHanded]: {
                    label: 'COSMERE.Item.Equip.Hold.TwoHanded.Label',
                    icon: '<i class="fa-solid fa-hands"></i>',
                },
            },
        },
    },

    weaponTypes: {
        [WeaponType.Light]: {
            label: 'COSMERE.Item.Weapon.Type.Light',
        },
        [WeaponType.Heavy]: {
            label: 'COSMERE.Item.Weapon.Type.Heavy',
        },
        [WeaponType.Special]: {
            label: 'COSMERE.Item.Weapon.Type.Special',
        },
    },

    // TODO: These should reference their respective item ids in the compendium
    weapons: {
        [WeaponId.Improvised]: { reference: '' },
        [WeaponId.Unarmed]: { reference: '' },
    },

    armors: {},

    expertiseTypes: {
        [ExpertiseType.Armor]: {
            label: 'COSMERE.Actor.Character.Expertise.Armor',
        },
        [ExpertiseType.Cultural]: {
            label: 'COSMERE.Actor.Character.Expertise.Cultural',
        },
        [ExpertiseType.Specialist]: {
            label: 'COSMERE.Actor.Character.Expertise.Specialist',
        },
        [ExpertiseType.Utility]: {
            label: 'COSMERE.Actor.Character.Expertise.Utility',
        },
        [ExpertiseType.Weapon]: {
            label: 'COSMERE.Actor.Character.Expertise.Weapon',
        },
    },

    traits: {
        weaponTraits: {
            [WeaponTraitId.Cumbersome]: {
                label: 'COSMERE.Item.Weapon.Trait.Cumbersome',
                hasValue: true,
            },
            [WeaponTraitId.Dangerous]: {
                label: 'COSMERE.Item.Weapon.Trait.Dangerous',
            },
            [WeaponTraitId.Deadly]: {
                label: 'COSMERE.Item.Weapon.Trait.Deadly',
            },
            [WeaponTraitId.Defensive]: {
                label: 'COSMERE.Item.Weapon.Trait.Defensive',
            },
            [WeaponTraitId.Discreet]: {
                label: 'COSMERE.Item.Weapon.Trait.Discreet',
            },
            [WeaponTraitId.Indirect]: {
                label: 'COSMERE.Item.Weapon.Trait.Indirect',
            },
            [WeaponTraitId.Loaded]: {
                label: 'COSMERE.Item.Weapon.Trait.Loaded',
                hasValue: true,
            },
            [WeaponTraitId.Momentum]: {
                label: 'COSMERE.Item.Weapon.Trait.Momentum',
            },
            [WeaponTraitId.Offhand]: {
                label: 'COSMERE.Item.Weapon.Trait.Offhand',
            },
            [WeaponTraitId.Pierce]: {
                label: 'COSMERE.Item.Weapon.Trait.Pierce',
            },
            [WeaponTraitId.Quickdraw]: {
                label: 'COSMERE.Item.Weapon.Trait.Quickdraw',
            },
            [WeaponTraitId.Thrown]: {
                label: 'COSMERE.Item.Weapon.Trait.Thrown',
            },
            [WeaponTraitId.TwoHanded]: {
                label: 'COSMERE.Item.Weapon.Trait.TwoHanded',
            },
            [WeaponTraitId.Unique]: {
                label: 'COSMERE.Item.Weapon.Trait.Unique',
            },
            [WeaponTraitId.Fragile]: {
                label: 'COSMERE.Item.Weapon.Trait.Fragile',
            },
        },

        armorTraits: {
            [ArmorTraitId.Cumbersome]: {
                label: 'COSMERE.Item.Armor.Trait.Cumbersome',
                hasValue: true,
            },
            [ArmorTraitId.Dangerous]: {
                label: 'COSMERE.Item.Armor.Trait.Dangerous',
            },
            [ArmorTraitId.Presentable]: {
                label: 'COSMERE.Item.Armor.Trait.Presentable',
            },
        },
    },

    adversary: {
        roles: {
            [AdversaryRole.Minion]: {
                label: 'COSMERE.Actor.Adversary.Role.Minion',
            },
            [AdversaryRole.Rival]: {
                label: 'COSMERE.Actor.Adversary.Role.Rival',
            },
            [AdversaryRole.Boss]: {
                label: 'COSMERE.Actor.Adversary.Role.Boss',
            },
        },
    },

    deflect: {
        sources: {
            [DeflectSource.None]: {
                label: 'GENERIC.None',
            },
            [DeflectSource.Armor]: {
                label: 'COSMERE.Item.Type.Armor',
            },
        },
    },

    action: {
        types: {
            [ActionType.Basic]: {
                label: 'COSMERE.Item.Action.Type.Basic.label',
                labelPlural: 'COSMERE.Item.Action.Type.Basic.label_plural',
            },
        },
        costs: {
            [ActionCostType.Action]: {
                label: 'COSMERE.Actor.ActionCosts.Action',
            },
            [ActionCostType.Reaction]: {
                label: 'COSMERE.Actor.ActionCosts.Reaction',
            },
            [ActionCostType.FreeAction]: {
                label: 'COSMERE.Actor.ActionCosts.FreeAction',
            },
            [ActionCostType.Special]: {
                label: 'COSMERE.Actor.ActionCosts.Special',
            },
        },
    },

    attack: {
        types: {
            [AttackType.Melee]: {
                label: 'COSMERE.Attack.Type.Melee',
            },
            [AttackType.Ranged]: {
                label: 'COSMERE.Attack.Type.Ranged',
            },
        },
    },

    damageTypes: {
        [DamageType.Energy]: {
            label: 'COSMERE.DamageTypes.Energy',
        },
        [DamageType.Impact]: {
            label: 'COSMERE.DamageTypes.Impact',
        },
        [DamageType.Keen]: {
            label: 'COSMERE.DamageTypes.Keen',
        },
        [DamageType.Spirit]: {
            label: 'COSMERE.DamageTypes.Spirit',
            ignoreDeflect: true,
        },
        [DamageType.Vital]: {
            label: 'COSMERE.DamageTypes.Vital',
            ignoreDeflect: true,
        },
        [DamageType.Healing]: {
            label: 'COSMERE.DamageTypes.Healing',
        },
    },
};

export default COSMERE;
