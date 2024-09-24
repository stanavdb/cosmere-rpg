import { CosmereItem } from '@src/system/documents';

// Mixins
import { DataModelMixin } from '../mixins';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';
import { PhysicalItemMixin, PhysicalItemData } from './mixins/physical';

export interface LootItemData extends DescriptionItemData, PhysicalItemData {}

export class LootItemDataModel extends DataModelMixin<
    LootItemData,
    CosmereItem
>(DescriptionItemMixin(), PhysicalItemMixin()) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {});
    }
}
