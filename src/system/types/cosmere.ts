export const enum Size {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
    Huge = 'huge',
    Garguantuan = 'gargantuan',
}

/**
 * A non-exhaustive list of creature types.
 * Used to provide standard options.
 */
export const enum CreatureType {
    Humanoid = 'humanoid',
    Animal = 'animal',
}

/**
 * A non-exhaustive list of conditions
 */
export const enum Condition {
    Afflicted = 'afflicted',
    Determined = 'determined',
    Disoriented = 'disoriented',
    Empowered = 'empowered',
    Enhanced = 'enhanced',
    Exhausted = 'exhausted',
    Encumbered = 'encumbered',
    Focused = 'focused',
    Immobilized = 'immobilized',
    Prone = 'prone',
    Restrained = 'restrained',
    Slowed = 'slowed',
    Stunned = 'stunned',
    Surprised = 'surprised',
    Unconcious = 'unconcious',
}

export const enum InjuryType {
    FleshWound = 'flesh_wound',
    ShallowInjury = 'shallow_injury',
    ViciousInjury = 'vicious_injury',
    PermanentInjury = 'permanent_injury',
    Death = 'death',
}

export const enum AttributeGroup {
    Physical = 'phy',
    Cognitive = 'cog',
    Spiritual = 'spi',
}

export const enum Attribute {
    Strength = 'str',
    Speed = 'spd',
    Intellect = 'int',
    Willpower = 'wil',
    Awareness = 'awa',
    Presence = 'pre',
}

export const enum Resource {
    Health = 'hea',
    Focus = 'foc',
    Investiture = 'inv',
}

export const enum Skill {
    Agility = 'agi',
    Athletics = 'ath',
    HeavyWeapons = 'hwp',
    LightWeapons = 'lwp',
    Stealth = 'stl',
    Thievery = 'thv',

    Crafting = 'cra',
    Deduction = 'ded',
    Discipline = 'dis',
    Intimidation = 'inm',
    Lore = 'lor',
    Medicine = 'med',

    Deception = 'dec',
    Insight = 'ins',
    Leadership = 'lea',
    Perception = 'prc',
    Persuasion = 'prs',
    Survival = 'sur',
}

export const enum DerivedStatistic {
    MovementRate = 'mvr',
    LiftingCapactiy = 'lif',
    RecoveryDie = 'rcd',
}

export const enum PathType {
    Heroic = 'heroic',
}

/**
 * The categories of weapon available
 */
export const enum WeaponType {
    Light = 'light_wpn',
    Heavy = 'heavy_wpn',
    Special = 'special_wpn',
}

/**
 * The ids of all default system weapons.
 * This is not an exhaustive list of all possible weapons,
 * but is used to populate the `CONFIG.COSMERE.weapons` property.
 */
export const enum WeaponId {
    // Special
    Improvised = 'improvised',
    Unarmed = 'unarmed',
}

/**
 * The ids of all default system armors.
 * This is not an exhaustive list of all possible weapons,
 * but is used to populate the `CONFIG.COSMERE.armors` property.
 */
export const enum ArmorId {}

export const enum ExpertiseType {
    Armor = 'armor',
    Cultural = 'cultural',
    Specialist = 'specialist',
    Utility = 'utility',
    Weapon = 'weapon',
}

/**
 * The ids of all default system weapon traits.
 * This is not an exhaustive list of all possible weapon traits,
 * but is used to populate the `CONFIG.COSMERE.traits.weaponTraitIds` property.
 */
export const enum WeaponTraitId {
    Cumbersome = 'cumbersome',
    Dangerous = 'dangerous',
    Deadly = 'deadly',
    Defensive = 'defensive',
    Discreet = 'discreet',
    Indirect = 'indirect',
    Loaded = 'loaded',
    Momentum = 'momentum',
    Offhand = 'offhand',
    Pierce = 'pierce',
    Quickdraw = 'quickdraw',
    Thrown = 'thrown',
    TwoHanded = 'two_handed',
    Unique = 'unique',
    Fragile = 'fragile',
}

/**
 * The ids of all default system armor traits.
 * This is not an exhaustive list of all possible armor traits,
 * but is used to populate the `CONFIG.COSMERE.traits.armorTraitIds` property.
 */
export const enum ArmorTraitId {
    Cumbersome = 'cumbersome',
    Dangerous = 'dangerous',
    Presentable = 'presentable',
}

export const enum AdversaryRole {
    Minion = 'minion',
    Rival = 'rival',
    Boss = 'boss',
}

export const enum DeflectSource {
    None = 'none',
    Armor = 'armor',
}

export const enum ActivationType {
    Action = 'action',
    Utility = 'utility',
    SkillTest = 'skill_test',
}

export const enum ItemConsumeType {
    ActorResource = 'actor_resource', // E.g. health, focus, investiture
    ItemResource = 'item_resource', // E.g. uses, charges
    Item = 'item',
}

export const enum ItemResource {
    Use = 'use',
    Charge = 'charge',
}

export const enum ItemRechargeType {
    PerScene = 'per_scene',
}

export const enum EquipType {
    Hold = 'hold', // Item that you equip by holding it (either in one or two hands)
    Wear = 'wear', // Item that you equip by wearing it
}

export const enum HoldType {
    OneHanded = 'one_handed',
    TwoHanded = 'two_handed',
}

export const enum EquipHand {
    Main = 'main_hand',
    Off = 'off_hand',
}

export const enum ActionType {
    Basic = 'basic',
}

export const enum ActionCostType {
    Action = 'act',
    Reaction = 'rea',
    FreeAction = 'fre',
    Special = 'spe',
}

export const enum AttackType {
    Melee = 'melee',
    Ranged = 'ranged',
}

export const enum DamageType {
    Energy = 'energy',
    Impact = 'impact',
    Keen = 'keen',
    Spirit = 'spirit',
    Vital = 'vital',
    Healing = 'heal',
}

/* --- System --- */

export const enum ActorType {
    Character = 'character',
    Adversary = 'adversary',
}

export const enum ItemType {
    Weapon = 'weapon',
    Armor = 'armor',
    Equipment = 'equipment',

    Ancestry = 'ancestry',
    Path = 'path',
    Talent = 'talent',
    Trait = 'trait',

    Action = 'action',

    Injury = 'injury',
    Connection = 'connection',
}

export const enum TurnSpeed {
    Fast = 'fast',
    Slow = 'slow',
}
