import { PathType, Skill } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents/item';

// Mixins
import { DataModelMixin } from '../mixins';
import { IdItemMixin, IdItemData } from './mixins/id';
import { TypedItemMixin, TypedItemData } from './mixins/typed';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';
import {
    TriggerableItemMixin,
    TriggerableItemData,
} from './mixins/triggerable';

export interface PathItemData
    extends IdItemData,
        TypedItemData<PathType>,
        DescriptionItemData,
        TriggerableItemData {
    /**
     * The UUIDs of the talent trees linked to this path.
     */
    talentTrees: string[];

    /**
     * The non-core skills linked to this path.
     * These skills are displayed with the path in the sheet.
     */
    linkedSkills: Skill[];
}

export class PathItemDataModel extends DataModelMixin<
    PathItemData,
    CosmereItem
>(
    IdItemMixin({ initialFromName: true }),
    TypedItemMixin<CosmereItem, PathType>({
        initial: PathType.Heroic,
        choices: () => {
            return Object.entries(CONFIG.COSMERE.path.types).reduce(
                (acc, [key, value]) => ({
                    ...acc,
                    [key]: value.label,
                }),
                {} as Record<PathType, string>,
            );
        },
    }),
    DescriptionItemMixin({
        value: 'COSMERE.Item.Type.Path.desc_placeholder',
    }),
    TriggerableItemMixin(),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            talentTrees: new foundry.data.fields.ArrayField(
                new foundry.data.fields.DocumentUUIDField({
                    blank: false,
                }),
                {
                    required: true,
                    nullable: false,
                    initial: [],
                },
            ),
            linkedSkills: new foundry.data.fields.ArrayField(
                new foundry.data.fields.StringField({
                    required: true,
                    nullable: false,
                    blank: false,
                    choices: () =>
                        Object.entries(CONFIG.COSMERE.skills)
                            .filter(([key, skill]) => !skill.core)
                            .reduce(
                                (acc, [key, skill]) => ({
                                    ...acc,
                                    [key]: skill.label,
                                }),
                                {},
                            ),
                }),
                {
                    required: true,
                    nullable: false,
                    initial: [],
                    label: 'COSMERE.Item.Path.LinkedSkills.Label',
                    hint: 'COSMERE.Item.Path.LinkedSkills.Hint',
                },
            ),

            // TODO: Advancements
        });
    }

    get typeLabel(): string {
        return CONFIG.COSMERE.path.types[this.type].label;
    }
}
