export enum Size {
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
export enum CreatureType {
    Humanoid = 'humanoid',
    Animal = 'animal',
}

/**
 * A non-exhaustive list of conditions
 */
export enum Condition {
    Afflicted = 'afflicted',
    Determined = 'determined',
    Disoriented = 'disoriented',
    Empowered = 'empowered',
    Enhanced = 'enhanced',
    Exhausted = 'exhausted',
    Focused = 'focused',
    Immobilized = 'immobilized',
    Prone = 'prone',
    Restrained = 'restrained',
    Slowed = 'slowed',
    Stunned = 'stunned',
    Surprised = 'surprised',
    Unconcious = 'unconcious',
}

export enum InjuryDuration {
    FleshWound = 'flesh_wound',
    ShallowInjury = 'shallow_injury',
    ViciousInjury = 'vicious_injury',
    PermanentInjury = 'permanent_injury',
    Death = 'death',
}

export enum AttributeGroup {
    Physical = 'phy',
    Cognitive = 'cog',
    Spiritual = 'spi',
}

export enum Attribute {
    Strength = 'str',
    Speed = 'spd',
    Intellect = 'int',
    Willpower = 'wil',
    Awareness = 'awa',
    Presence = 'pre',
}

export enum Resource {
    Health = 'hea',
    Focus = 'foc',
    Investiture = 'inv',
}

export enum Skill {
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

export enum DerivedStatistic {
    MovementRate = 'mvr',
    LiftingCapactiy = 'lif',
    RecoveryDie = 'rcd',
}

/**
 * The categories of weapon available
 */
export enum WeaponType {
    Light = 'light_wpn',
    Heavy = 'heavy_wpn',
    Special = 'special_wpn',
}

/**
 * The ids of all default system weapons.
 * This is not an exhaustive list of all possible weapons,
 * but is used to populate the `CONFIG.COSMERE.weapons` property.
 */
export enum WeaponId {
    // Special
    Improvised = 'improvised',
    Unarmed = 'unarmed',
}

/**
 * The ids of all default system armors.
 * This is not an exhaustive list of all possible weapons,
 * but is used to populate the `CONFIG.COSMERE.armors` property.
 */
export enum ArmorId {}

export enum ExpertiseType {
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
export enum WeaponTraitId {
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
export enum ArmorTraitId {
    Cumbersome = 'cumbersome',
    Dangerous = 'dangerous',
    Presentable = 'presentable',
}

export enum AdversaryRole {
    Minion = 'minion',
    Rival = 'rival',
    Boss = 'boss',
}

export enum DeflectSource {
    None = 'none',
    Armor = 'armor',
}

export enum ActivationType {
    Action = 'action',
    Utility = 'utility',
    SkillTest = 'skill_test',
}

export enum ItemConsumeType {
    ActorResource = 'actor_resource', // E.g. health, focus, investiture
    ItemResource = 'item_resource', // E.g. uses, charges
    Item = 'item',
}

export enum ItemResource {
    Use = 'use',
    Charge = 'charge',
}

export enum ItemRechargeType {
    PerScene = 'per_scene',
}

export enum EquipType {
    Hold = 'hold', // Item that you equip by holding it (either in one or two hands)
    Wear = 'wear', // Item that you equip by wearing it
}

export enum HoldType {
    MainHand = 'main_hand',
    OffHand = 'off_hand',
    TwoHanded = 'two_handed',
}

export enum ActionType {
    Basic = 'basic',
}

export enum ActionCostType {
    Action = 'act',
    Reaction = 'rea',
    FreeAction = 'fre',
    Special = 'spe',
}

export enum AttackType {
    Melee = 'melee',
    Ranged = 'ranged',
}

export enum DamageType {
    Energy = 'energy',
    Impact = 'impact',
    Keen = 'keen',
    Spirit = 'spirit',
    Vital = 'vital',
    Healing = 'heal',
}

/* --- System --- */

export enum ActorType {
    Character = 'character',
    Adversary = 'adversary',
}

export enum ItemType {
    Weapon = 'weapon',
    Armor = 'armor',
    Equipment = 'equipment',

    Ancestry = 'ancestry',
    Path = 'path',
    Talent = 'talent',
    Trait = 'trait',

    Action = 'action',

    Injury = 'injury',
}
