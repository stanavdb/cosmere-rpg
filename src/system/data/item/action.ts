// Mixins
import { DataModelMixin } from '../mixins';
import { DescriptionItemMixin, DescriptionItemData } from './mixins/description';
import { ActivatableItemMixin, ActivatableItemData } from './mixins/activatable';

export interface ActionItemData extends 
    DescriptionItemData, ActivatableItemData {

}

export class ActionItemDataModel extends DataModelMixin(
    DescriptionItemMixin(),
    ActivatableItemMixin()
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            
        });
    }
}