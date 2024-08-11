import { ItemType } from '@system/types/cosmere';

import { WeaponItemDataModel } from './weapon';
import { ArmorItemDataModel } from './armor';
import { EquipmentItemDataModel } from './equipment';
import { FabrialItemDataModel } from './fabrial';

import { AncestryItemDataModel } from './ancestry';
import { PathItemDataModel } from './path';
import { TalentItemDataModel } from './talent';

import { ActionItemDataModel } from './action';

export const config: Record<ItemType, typeof foundry.abstract.TypeDataModel> = {
    [ItemType.Weapon]: WeaponItemDataModel as any,
    [ItemType.Armor]: ArmorItemDataModel as any,
    [ItemType.Equipment]: EquipmentItemDataModel as any,
    [ItemType.Fabrial]: FabrialItemDataModel as any,

    [ItemType.Ancestry]: AncestryItemDataModel as any,
    [ItemType.Path]: PathItemDataModel as any,
    [ItemType.Talent]: TalentItemDataModel as any,

    [ItemType.Action]: ActionItemDataModel as any
}

export * from './weapon';
export * from './armor';
export * from './equipment';
export * from './fabrial';
export * from './ancestry';
export * from './path';
export * from './talent';
export * from './action';