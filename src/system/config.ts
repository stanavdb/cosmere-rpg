// Types
import { CosmereRPGConfig } from "./types/config";
import {
  Attribute,
  AttributeGroup,
  Resource,
  Skill,
  AttributeShortLabel,
  WeaponType,
  WeaponId,
  ArmorId,
  ExpertiseType,
  WeaponTraitId,
  ArmorTraitId,
  ActionCostType,
  DamageType,
} from "./types/cosmere";

const COSMERE: CosmereRPGConfig = {
  attributeGroups: {
    [AttributeGroup.Physical]: {
      label: "COSMERE.AttributeGroup.Physical.long",
      attributes: [Attribute.Strength, Attribute.Speed],
      resource: Resource.Health,
    },
    [AttributeGroup.Cognitive]: {
      label: "COSMERE.AttributeGroup.Cognitive.long",
      attributes: [Attribute.Intellect, Attribute.Willpower],
      resource: Resource.Focus,
    },
    [AttributeGroup.Spiritual]: {
      label: "COSMERE.AttributeGroup.Spiritual.long",
      attributes: [Attribute.Awareness, Attribute.Presence],
      resource: Resource.Investiture,
    },
  },

  attributes: {
    [Attribute.Strength]: {
      label: "COSMERE.Actor.Attribute.Strength.long",
      skills: [Skill.Athletics, Skill.HeavyWeapons],
    },
    [Attribute.Speed]: {
      label: "COSMERE.Actor.Attribute.Speed.long",
      skills: [
        Skill.Agility,
        Skill.LightWeapons,
        Skill.Stealth,
        Skill.Thievery,
      ],
    },
    [Attribute.Intellect]: {
      label: "COSMERE.Actor.Attribute.Intellect.long",
      skills: [Skill.Crafting, Skill.Deduction, Skill.Lore, Skill.Medicine],
    },
    [Attribute.Willpower]: {
      label: "COSMERE.Actor.Attribute.Willpower.long",
      skills: [Skill.Discipline, Skill.Intimidation, Skill.Transformation],
    },
    [Attribute.Awareness]: {
      label: "COSMERE.Actor.Attribute.Awareness.long",
      skills: [
        Skill.Insight,
        Skill.Perception,
        Skill.Survival,

        Skill.Gravitation,
      ],
    },
    [Attribute.Presence]: {
      label: "COSMERE.Actor.Attribute.Presence.long",
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
      label: "COSMERE.Actor.Resource.Health",
      deflect: true,
    },
    [Resource.Focus]: {
      label: "COSMERE.Actor.Resource.Focus",
    },
    [Resource.Investiture]: {
      label: "COSMERE.Actor.Resource.Investiture",
    },
  },

  skills: {
    [Skill.Agility]: {
      label: "COSMERE.Actor.Skill.Agility",
      attribute: Attribute.Speed,
      attrLabel: AttributeShortLabel.Speed,
    },
    [Skill.Athletics]: {
      label: "COSMERE.Actor.Skill.Athletics",
      attribute: Attribute.Strength,
      attrLabel: AttributeShortLabel.Strength,
    },
    [Skill.HeavyWeapons]: {
      label: "COSMERE.Actor.Skill.HeavyWeapons",
      attribute: Attribute.Strength,
      attrLabel: AttributeShortLabel.Strength,
    },
    [Skill.LightWeapons]: {
      label: "COSMERE.Actor.Skill.LightWeapons",
      attribute: Attribute.Speed,
      attrLabel: AttributeShortLabel.Speed,
    },
    [Skill.Stealth]: {
      label: "COSMERE.Actor.Skill.Stealth",
      attribute: Attribute.Speed,
      attrLabel: AttributeShortLabel.Speed,
    },
    [Skill.Thievery]: {
      label: "COSMERE.Actor.Skill.Thievery",
      attribute: Attribute.Speed,
      attrLabel: AttributeShortLabel.Speed,
    },

    [Skill.Crafting]: {
      label: "COSMERE.Actor.Skill.Crafting",
      attribute: Attribute.Intellect,
      attrLabel: AttributeShortLabel.Intellect,
    },
    [Skill.Deduction]: {
      label: "COSMERE.Actor.Skill.Deduction",
      attribute: Attribute.Intellect,
      attrLabel: AttributeShortLabel.Intellect,
    },
    [Skill.Discipline]: {
      label: "COSMERE.Actor.Skill.Discipline",
      attribute: Attribute.Willpower,
      attrLabel: AttributeShortLabel.Willpower,
    },
    [Skill.Intimidation]: {
      label: "COSMERE.Actor.Skill.Intimidation",
      attribute: Attribute.Willpower,
      attrLabel: AttributeShortLabel.Willpower,
    },
    [Skill.Lore]: {
      label: "COSMERE.Actor.Skill.Lore",
      attribute: Attribute.Intellect,
      attrLabel: AttributeShortLabel.Intellect,
    },
    [Skill.Medicine]: {
      label: "COSMERE.Actor.Skill.Medicine",
      attribute: Attribute.Intellect,
      attrLabel: AttributeShortLabel.Intellect,
    },

    [Skill.Deception]: {
      label: "COSMERE.Actor.Skill.Deception",
      attribute: Attribute.Presence,
      attrLabel: AttributeShortLabel.Presence,
    },
    [Skill.Insight]: {
      label: "COSMERE.Actor.Skill.Insight",
      attribute: Attribute.Awareness,
      attrLabel: AttributeShortLabel.Awareness,
    },
    [Skill.Leadership]: {
      label: "COSMERE.Actor.Skill.Leadership",
      attribute: Attribute.Presence,
      attrLabel: AttributeShortLabel.Presence,
    },
    [Skill.Perception]: {
      label: "COSMERE.Actor.Skill.Perception",
      attribute: Attribute.Awareness,
      attrLabel: AttributeShortLabel.Awareness,
    },
    [Skill.Persuasion]: {
      label: "COSMERE.Actor.Skill.Persuasion",
      attribute: Attribute.Presence,
      attrLabel: AttributeShortLabel.Presence,
    },
    [Skill.Survival]: {
      label: "COSMERE.Actor.Skill.Survival",
      attribute: Attribute.Awareness,
      attrLabel: AttributeShortLabel.Awareness,
    },

    // Surges,
    [Skill.Adhesion]: {
      label: "COSMERE.Actor.Skill.Adhesion",
      attribute: Attribute.Presence,
      attrLabel: AttributeShortLabel.Presence,
      hiddenUntilAcquired: true,
    },
    [Skill.Gravitation]: {
      label: "COSMERE.Actor.Skill.Gravitation",
      attribute: Attribute.Awareness,
      attrLabel: AttributeShortLabel.Awareness,
      hiddenUntilAcquired: true,
    },
    [Skill.Illumination]: {
      label: "COSMERE.Actor.Skill.Illumination",
      attribute: Attribute.Presence,
      attrLabel: AttributeShortLabel.Presence,
      hiddenUntilAcquired: true,
    },
    [Skill.Transformation]: {
      label: "COSMERE.Actor.Skill.Transformation",
      attribute: Attribute.Willpower,
      attrLabel: AttributeShortLabel.Willpower,
      hiddenUntilAcquired: true,
    },
  },

  weaponTypes: {
    [WeaponType.Light]: {
      label: "COSMERE.Item.Weapon.Type.Light",
    },
    [WeaponType.Heavy]: {
      label: "COSMERE.Item.Weapon.Type.Heavy",
    },
    [WeaponType.Special]: {
      label: "COSMERE.Item.Weapon.Type.Special",
    },
  },

  // TODO: These should reference their respective item ids in the compendium
  weapons: {
    [WeaponId.Javelin]: { reference: "" },
    [WeaponId.Knife]: { reference: "" },
    [WeaponId.Mace]: { reference: "" },
    [WeaponId.Rapier]: { reference: "" },
    [WeaponId.Shortspear]: { reference: "" },
    [WeaponId.Sidesword]: { reference: "" },
    [WeaponId.Staff]: { reference: "" },
    [WeaponId.Shortbow]: { reference: "" },
    [WeaponId.Sling]: { reference: "" },

    [WeaponId.Axe]: { reference: "" },
    [WeaponId.Greatsword]: { reference: "" },
    [WeaponId.Hammer]: { reference: "" },
    [WeaponId.Longspear]: { reference: "" },
    [WeaponId.Longsword]: { reference: "" },
    [WeaponId.Poleaxe]: { reference: "" },
    [WeaponId.Shield]: { reference: "" },
    [WeaponId.Crossbow]: { reference: "" },
    [WeaponId.Longbow]: { reference: "" },

    [WeaponId.Improvised]: { reference: "" },
    [WeaponId.Unarmed]: { reference: "" },
    [WeaponId.Shardblade]: {
      reference: "",
      specialExpertise: true,
    },
  },

  // TODO: These should reference their respective item ids in the compendium
  armors: {
    [ArmorId.Uniform]: { reference: "" },
    [ArmorId.Leather]: { reference: "" },
    [ArmorId.Chain]: { reference: "" },
    [ArmorId.Breastplate]: { reference: "" },
    [ArmorId.HalfPlate]: { reference: "" },
    [ArmorId.FullPlate]: { reference: "" },
    [ArmorId.Shardplate]: {
      reference: "",
      specialExpertise: true,
    },
  },

  expertiseTypes: {
    [ExpertiseType.Armor]: {
      label: "COSMERE.Actor.Character.Expertise.Armor",
    },
    [ExpertiseType.Cultural]: {
      label: "COSMERE.Actor.Character.Expertise.Cultural",
    },
    [ExpertiseType.Specialist]: {
      label: "COSMERE.Actor.Character.Expertise.Specialist",
    },
    [ExpertiseType.Utility]: {
      label: "COSMERE.Actor.Character.Expertise.Utility",
    },
    [ExpertiseType.Weapon]: {
      label: "COSMERE.Actor.Character.Expertise.Weapon",
    },
  },

  traits: {
    weaponTraits: {
      [WeaponTraitId.Cumbersome]: {
        label: "COSMERE.Item.Weapon.Trait.Cumbersome",
        hasValue: true,
      },
      [WeaponTraitId.Dangerous]: {
        label: "COSMERE.Item.Weapon.Trait.Dangerous",
      },
      [WeaponTraitId.Deadly]: {
        label: "COSMERE.Item.Weapon.Trait.Deadly",
      },
      [WeaponTraitId.Defensive]: {
        label: "COSMERE.Item.Weapon.Trait.Defensive",
      },
      [WeaponTraitId.Discreet]: {
        label: "COSMERE.Item.Weapon.Trait.Discreet",
      },
      [WeaponTraitId.Indirect]: {
        label: "COSMERE.Item.Weapon.Trait.Indirect",
      },
      [WeaponTraitId.Loaded]: {
        label: "COSMERE.Item.Weapon.Trait.Loaded",
        hasValue: true,
      },
      [WeaponTraitId.Momentum]: {
        label: "COSMERE.Item.Weapon.Trait.Momentum",
      },
      [WeaponTraitId.Offhand]: {
        label: "COSMERE.Item.Weapon.Trait.Offhand",
      },
      [WeaponTraitId.Pierce]: {
        label: "COSMERE.Item.Weapon.Trait.Pierce",
      },
      [WeaponTraitId.Quickdraw]: {
        label: "COSMERE.Item.Weapon.Trait.Quickdraw",
      },
      [WeaponTraitId.Thrown]: {
        label: "COSMERE.Item.Weapon.Trait.Thrown",
      },
      [WeaponTraitId.TwoHanded]: {
        label: "COSMERE.Item.Weapon.Trait.TwoHanded",
      },
      [WeaponTraitId.Unique]: {
        label: "COSMERE.Item.Weapon.Trait.Unique",
      },
      [WeaponTraitId.Fragile]: {
        label: "COSMERE.Item.Weapon.Trait.Fragile",
      },
    },

    armorTraits: {
      [ArmorTraitId.Cumbersome]: {
        label: "COSMERE.Item.Armor.Trait.Cumbersome",
        hasValue: true,
      },
      [ArmorTraitId.Dangerous]: {
        label: "COSMERE.Item.Armor.Trait.Dangerous",
      },
      [ArmorTraitId.Presentable]: {
        label: "COSMERE.Item.Armor.Trait.Presentable",
      },
    },
  },

  actionCosts: {
    [ActionCostType.Action]: {
      label: "COSMERE.Actor.ActionCosts.Action",
    },
    [ActionCostType.Reaction]: {
      label: "COSMERE.Actor.ActionCosts.Reaction",
    },
    [ActionCostType.FreeAction]: {
      label: "COSMERE.Actor.ActionCosts.FreeAction",
    },
  },

  damageTypes: {
    [DamageType.Energy]: {
      label: "COSMERE.DamageTypes.Energy",
    },
    [DamageType.Impact]: {
      label: "COSMERE.DamageTypes.Impact",
    },
    [DamageType.Keen]: {
      label: "COSMERE.DamageTypes.Keen",
    },
    [DamageType.Spirit]: {
      label: "COSMERE.DamageTypes.Spirit",
      ignoreDeflect: true,
    },
    [DamageType.Vital]: {
      label: "COSMERE.DamageTypes.Vital",
      ignoreDeflect: true,
    },
  },
};

export default COSMERE;
