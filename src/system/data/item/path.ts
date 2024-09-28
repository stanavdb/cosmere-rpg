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
    IdItemMixin({ initialFromName: true }),
    TypedItemMixin<CosmereItem, PathType>({
        initial: PathType.Heroic,
        choices: () => {
            return Object.entries(CONFIG.COSMERE.paths.types).reduce(
                (acc, [key, value]) => ({
                    ...acc,
                    [key]: value.label,
                }),
                {} as Record<PathType, string>,
            );
        },
    }),
    DescriptionItemMixin(),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            // TODO: Advancements
        });
    }

    get typeLabel(): string {
        return CONFIG.COSMERE.paths.types[this.type].label;
    }

    get typeSelectOptions(): Record<string, string> {
        return (this.schema.fields.type as foundry.data.fields.StringField)
            .choices as Record<string, string>;
    }
}
