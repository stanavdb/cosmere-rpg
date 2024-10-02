import { ActionType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';

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
        TypedItemData<ActionType>,
        DamagingItemData {}

export class ActionItemDataModel extends DataModelMixin<
    ActionItemData,
    CosmereItem
>(
    TypedItemMixin({
        initial: ActionType.Basic,
        choices: () =>
            Object.entries(CONFIG.COSMERE.action.types).reduce(
                (acc, [key, config]) => ({
                    ...acc,
                    [key]: config.label,
                }),
                {} as Record<ActionType, string>,
            ),
    }),
    DescriptionItemMixin(),
    ActivatableItemMixin(),
    DamagingItemMixin(),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {});
    }
}
