// Mixins
import { DataModelMixin } from '../mixins';
import { DescriptionItemMixin, DescriptionItemData } from './mixins/description';

export interface PathItemData extends 
    DescriptionItemData {

}

export class PathItemDataModel extends DataModelMixin(
    DescriptionItemMixin()
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            // TODO: Advancements
        });
    }
}