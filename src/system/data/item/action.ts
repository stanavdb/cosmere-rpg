import { CosmereItem } from '@src/system/documents';

// Mixins
import { DataModelMixin } from '../mixins';
import { TypedItemMixin, TypedItemData } from './mixins/typed';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';
import {
    ActivatableItemMixin,
    ActivatableItemData,
} from './mixins/activatable';
import { DamagingItemMixin, DamagingItemData } from './mixins/damaging';

export interface ActionItemData
    extends DescriptionItemData,
        ActivatableItemData,
        TypedItemData,
        DamagingItemData {}

export class ActionItemDataModel extends DataModelMixin<
    ActionItemData,
    CosmereItem
>(
    TypedItemMixin(),
    DescriptionItemMixin(),
    ActivatableItemMixin(),
    DamagingItemMixin(),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {});
    }
}
