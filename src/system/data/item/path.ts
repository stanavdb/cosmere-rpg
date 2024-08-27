import { PathType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents/item';

// Mixins
import { DataModelMixin } from '../mixins';
import { IdItemMixin, IdItemData } from './mixins/id';
import { TypedItemMixin, TypedItemData } from './mixins/typed';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';

export interface PathItemData
    extends IdItemData,
        TypedItemData<PathType>,
        DescriptionItemData {}

export class PathItemDataModel extends DataModelMixin<
    PathItemData,
    CosmereItem
>(
    IdItemMixin(),
    TypedItemMixin<CosmereItem, PathType>({
        initial: PathType.Heroic,
        choices: () => {
            return Object.keys(CONFIG.COSMERE.paths.types) as PathType[];
        },
    }),
    DescriptionItemMixin(),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            // TODO: Advancements
        });
    }
}
