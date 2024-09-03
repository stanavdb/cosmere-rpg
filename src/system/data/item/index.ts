import { ItemType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents/item';

import { WeaponItemDataModel } from './weapon';
import { ArmorItemDataModel } from './armor';
import { EquipmentItemDataModel } from './equipment';

import { AncestryItemDataModel } from './ancestry';
import { PathItemDataModel } from './path';
import { TalentItemDataModel } from './talent';
import { TraitItemDataModel } from './trait';

import { ActionItemDataModel } from './action';

import { InjuryItemDataModel } from './injury';
import { ConnectionItemDataModel } from './connection';

export const config: Record<
    ItemType,
    typeof foundry.abstract.TypeDataModel<
        foundry.abstract.DataModel,
        CosmereItem
    >
> = {
    [ItemType.Weapon]: WeaponItemDataModel,
    [ItemType.Armor]: ArmorItemDataModel,
    [ItemType.Equipment]: EquipmentItemDataModel,

    [ItemType.Ancestry]: AncestryItemDataModel,
    [ItemType.Path]: PathItemDataModel,
    [ItemType.Talent]: TalentItemDataModel,
    [ItemType.Trait]: TraitItemDataModel,

    [ItemType.Action]: ActionItemDataModel,

    [ItemType.Injury]: InjuryItemDataModel,
    [ItemType.Connection]: ConnectionItemDataModel,
};

export * from './weapon';
export * from './armor';
export * from './equipment';
export * from './ancestry';
export * from './path';
export * from './talent';
export * from './action';
export * from './injury';
export * from './connection';
