import { ArmorId } from "@system/types/cosmere";
import { CosmereItem } from "@src/system/documents";

// Mixins
import { DataModelMixin } from "../mixins";
import { TypedItemMixin, TypedItemData } from "./mixins/typed";
import {
  DescriptionItemMixin,
  DescriptionItemData,
} from "./mixins/description";
import { EquippableItemMixin, EquippableItemData } from "./mixins/equippable";
import { TraitsItemMixin, TraitsItemData } from "./mixins/traits";
import { PhysicalItemMixin, PhysicalItemData } from "./mixins/physical";
import { ExpertiseItemMixin, ExpertiseItemData } from "./mixins/expertise";

export interface ArmorItemData
  extends TypedItemData<ArmorId>,
    DescriptionItemData,
    EquippableItemData,
    TraitsItemData,
    PhysicalItemData,
    ExpertiseItemData {
  deflect?: number;
}

export class ArmorItemDataModel extends DataModelMixin<
  ArmorItemData,
  CosmereItem
>(
  TypedItemMixin(),
  DescriptionItemMixin(),
  EquippableItemMixin(),
  TraitsItemMixin(),
  PhysicalItemMixin(),
  ExpertiseItemMixin(),
) {
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      deflect: new foundry.data.fields.NumberField({ min: 0 }),
    });
  }
}
