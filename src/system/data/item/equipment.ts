// Mixins
import { DataModelMixin } from "../mixins";
import { TypedItemMixin, TypedItemData } from "./mixins/typed";
import {
  DescriptionItemMixin,
  DescriptionItemData,
} from "./mixins/description";
import { PhysicalItemMixin, PhysicalItemData } from "./mixins/physical";

export interface EquipmentItemData
  extends TypedItemData,
    DescriptionItemData,
    PhysicalItemData {}

export class EquipmentItemDataModel extends DataModelMixin(
  TypedItemMixin(),
  DescriptionItemMixin(),
  PhysicalItemMixin(),
) {
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {});
  }
}
