export enum AttributeGroup {
  Physical = "phy",
  Cognitive = "cog",
  Spiritual = "spi",
}

export enum Attribute {
  Strength = "str",
  Speed = "spd",
  Intellect = "int",
  Willpower = "wil",
  Awareness = "awa",
  Presence = "pre",
}

export enum AttributeShortLabel {
  Strength = "COSMERE.Actor.Attribute.Strength.short",
  Speed = "COSMERE.Actor.Attribute.Speed.short",
  Intellect = "COSMERE.Actor.Attribute.Intellect.short",
  Willpower = "COSMERE.Actor.Attribute.Willpower.short",
  Awareness = "COSMERE.Actor.Attribute.Awareness.short",
  Presence = "COSMERE.Actor.Attribute.Presence.short",
}

export enum Resource {
  Health = "hea",
  Focus = "foc",
  Investiture = "inv",
}

export enum Skill {
  Agility = "agi",
  Athletics = "ath",
  HeavyWeapons = "hwp",
  LightWeapons = "lwp",
  Stealth = "stl",
  Thievery = "thv",

  Crafting = "cra",
  Deduction = "ded",
  Discipline = "dis",
  Intimidation = "inm",
  Lore = "lor",
  Medicine = "med",

  Deception = "dec",
  Insight = "ins",
  Leadership = "lea",
  Perception = "prc",
  Persuasion = "prs",
  Survival = "sur",

  // Surge skills
  Adhesion = "adh",
  Gravitation = "gra",
  Illumination = "ill",
  Transformation = "tra",
}

export enum DerivedStatistic {
  MovementRate = "mvr",
  LiftingCapactiy = "lif",
  RecoveryDie = "rcd",
}

/**
 * The categories of weapon available
 */
export enum WeaponType {
  Light = "light_wpn",
  Heavy = "heavy_wpn",
  Special = "special_wpn",
}

/**
 * The ids of all default system weapons.
 * This is not an exhaustive list of all possible weapons,
 * but is used to populate the `CONFIG.COSMERE.weapons` property.
 */
export enum WeaponId {
  // Light weapons
  Javelin = "javelin",
  Knife = "knife",
  Mace = "mace",
  Rapier = "rapier",
  Shortspear = "shortspear",
  Sidesword = "sidesword",
  Staff = "staff",
  Shortbow = "shortbow",
  Sling = "sling",

  // Heavy weapons
  Axe = "axe",
  Greatsword = "greatsword",
  Hammer = "hammer",
  Longspear = "longspear",
  Longsword = "longsword",
  Poleaxe = "poleaxe",
  Shield = "shield",
  Crossbow = "crossbow",
  Longbow = "longbow",

  // Special
  Improvised = "improvised",
  Unarmed = "unarmed",
  Shardblade = "shardblade",
}

/**
 * The ids of all default system armors.
 * This is not an exhaustive list of all possible weapons,
 * but is used to populate the `CONFIG.COSMERE.armors` property.
 */
export enum ArmorId {
  Uniform = "uniform",
  Leather = "leather",
  Chain = "chain",
  Breastplate = "breastplate",
  HalfPlate = "half_plate",
  FullPlate = "plate",
  Shardplate = "shardplate",
}

export enum ExpertiseType {
  Armor = "armor",
  Cultural = "cultural",
  Specialist = "specialist",
  Utility = "utility",
  Weapon = "weapon",
}

/**
 * The ids of all default system weapon traits.
 * This is not an exhaustive list of all possible weapon traits,
 * but is used to populate the `CONFIG.COSMERE.traits.weaponTraitIds` property.
 */
export enum WeaponTraitId {
  Cumbersome = "cumbersome",
  Dangerous = "dangerous",
  Deadly = "deadly",
  Defensive = "defensive",
  Discreet = "discreet",
  Indirect = "indirect",
  Loaded = "loaded",
  Momentum = "momentum",
  Offhand = "offhand",
  Pierce = "pierce",
  Quickdraw = "quickdraw",
  Thrown = "thrown",
  TwoHanded = "two_handed",
  Unique = "unique",
  Fragile = "fragile",
}

/**
 * The ids of all default system armor traits.
 * This is not an exhaustive list of all possible armor traits,
 * but is used to populate the `CONFIG.COSMERE.traits.armorTraitIds` property.
 */
export enum ArmorTraitId {
  Cumbersome = "cumbersome",
  Dangerous = "dangerous",
  Presentable = "presentable",
}

export enum ActionCostType {
  Action = "act",
  Reaction = "rea",
  FreeAction = "fre",
}

export enum DamageType {
  Energy = "energy",
  Impact = "impact",
  Keen = "keen",
  Spirit = "spirit",
  Vital = "vital",
}

/* --- System --- */

export enum ActorType {
  Character = "character",
  Adversary = "adversary",
}

export enum ItemType {
  Weapon = "weapon",
  Armor = "armor",
  Equipment = "equipment",
  Fabrial = "fabrial",

  Ancestry = "ancestry",
  Path = "path",
  Talent = "talent",

  Action = "action",
}
