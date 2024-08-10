import { WeaponItemDataModel } from './weapon';
import { ArmorItemDataModel } from './armor';
import { EquipmentItemDataModel } from './equipment';
import { FabrialItemDataModel } from './fabrial';

import { AncestryItemDataModel } from './ancestry';
import { PathItemDataModel } from './path';
import { TalentItemDataModel } from './talent';

import { ActionItemDataModel } from './action';

export const config = {
    weapon: WeaponItemDataModel,
    armor: ArmorItemDataModel,
    equipment: EquipmentItemDataModel,
    fabrial: FabrialItemDataModel,

    ancestry: AncestryItemDataModel,
    path: PathItemDataModel,
    talent: TalentItemDataModel,

    action: ActionItemDataModel
}

export * from './weapon';
export * from './armor';
export * from './equipment';
export * from './fabrial';
export * from './ancestry';
export * from './path';
export * from './talent';
export * from './action';