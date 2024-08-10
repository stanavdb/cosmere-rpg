export enum AttributeGroup {
    Physical = 'phy',
    Cognitive = 'cog',
    Spiritual = 'spi'
}

export enum Attribute {
    Strength = 'str',
    Speed = 'spd',
    Intellect = 'int',
    Willpower = 'wil',
    Awareness = 'awa',
    Presence = 'pre'
}

export enum Resource {
    Health = 'hea',
    Focus = 'foc',
    Investiture = 'inv'
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

    // Surge skills
    Adhesion = 'adh',
    Gravitation = 'gra',
    Illumination = 'ill',
    Transformation = 'tra'
}

export enum DerivedStatistic {
    MovementRate = 'mvr',
    LiftingCapactiy = 'lif',
    RecoveryDie = 'rcd',
}

export enum ActionCostType {
    Action = 'act',
    Reaction = 'rea',
    FreeAction = 'fre'
}

export enum DamageType {
    Energy = 'energy',
    Impact = 'impact',
    Keen = 'keen',
    Spirit = 'spirit',
    Vital = 'vital',
}