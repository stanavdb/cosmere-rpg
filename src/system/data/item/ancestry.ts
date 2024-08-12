// Mixins
import { DataModelMixin } from "../mixins";
import { TypedItemMixin, TypedItemData } from "./mixins/typed";
import {
  DescriptionItemMixin,
  DescriptionItemData,
} from "./mixins/description";

export interface AncestryItemData extends TypedItemData, DescriptionItemData {}

export class AncestryItemDataModel extends DataModelMixin(
  TypedItemMixin(),
  DescriptionItemMixin(),
) {
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      // TODO: Advancements
    });
  }
}
