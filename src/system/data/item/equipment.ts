import { EquipmentType } from '@system/types/cosmere';
import { CosmereItem } from '@src/system/documents';

// Mixins
import { DataModelMixin } from '../mixins';
import { TypedItemMixin, TypedItemData } from './mixins/typed';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';
import { PhysicalItemMixin, PhysicalItemData } from './mixins/physical';
import {
    ActivatableItemMixin,
    ActivatableItemData,
} from './mixins/activatable';

export interface EquipmentItemData
    extends TypedItemData<EquipmentType>,
        DescriptionItemData,
        PhysicalItemData,
        ActivatableItemData {}

export class EquipmentItemDataModel extends DataModelMixin<
    EquipmentItemData,
    CosmereItem
>(
    TypedItemMixin({
        initial: EquipmentType.Basic,
        choices: () =>
            Object.entries(CONFIG.COSMERE.items.equipment.types).reduce(
                (acc, [key, config]) => ({
                    ...acc,
                    [key]: config.label,
                }),
                {} as Record<EquipmentType, string>,
            ),
    }),
    DescriptionItemMixin(),
    PhysicalItemMixin(),
    ActivatableItemMixin(),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {});
    }
}
