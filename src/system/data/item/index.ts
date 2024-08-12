import { ItemType } from "@system/types/cosmere";
import { CosmereItem } from "@system/documents/item";

import { WeaponItemDataModel } from "./weapon";
import { ArmorItemDataModel } from "./armor";
import { EquipmentItemDataModel } from "./equipment";
import { FabrialItemDataModel } from "./fabrial";

import { AncestryItemDataModel } from "./ancestry";
import { PathItemDataModel } from "./path";
import { TalentItemDataModel } from "./talent";

import { ActionItemDataModel } from "./action";

export const config: Record<
  ItemType,
  typeof foundry.abstract.TypeDataModel<foundry.abstract.DataModel, CosmereItem>
> = {
  [ItemType.Weapon]: WeaponItemDataModel,
  [ItemType.Armor]: ArmorItemDataModel,
  [ItemType.Equipment]: EquipmentItemDataModel,
  [ItemType.Fabrial]: FabrialItemDataModel,

  [ItemType.Ancestry]: AncestryItemDataModel,
  [ItemType.Path]: PathItemDataModel,
  [ItemType.Talent]: TalentItemDataModel,

  [ItemType.Action]: ActionItemDataModel,
};

export * from "./weapon";
export * from "./armor";
export * from "./equipment";
export * from "./fabrial";
export * from "./ancestry";
export * from "./path";
export * from "./talent";
export * from "./action";
