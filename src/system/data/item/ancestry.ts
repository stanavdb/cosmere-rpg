// Mixins
import { DataModelMixin } from '../mixins';
import { TypedItemMixin, TypedItemData } from './mixins/typed';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';

export interface AncestryItemData extends TypedItemData, DescriptionItemData {}

export class AncestryItemDataModel extends DataModelMixin(
    TypedItemMixin(),
    DescriptionItemMixin({
        value: 'COSMERE.Item.Type.Ancestry.desc_placeholder',
    }),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            advancement: new foundry.data.fields.SchemaField({
                extraTalentPicks: new foundry.data.fields.SchemaField({
                    levels: new foundry.data.fields.ArrayField(
                        new foundry.data.fields.NumberField(),
                    ),
                    restrictions: new foundry.data.fields.ObjectField(),
                    // ^ how to define a rule object?... e.g. "only attaches to owned talent in singer tree"
                }),
                extraTalentTrees: new foundry.data.fields.StringField(),
                extraTalents: new foundry.data.fields.ArrayField(
                    new foundry.data.fields.SchemaField({
                        name: new foundry.data.fields.StringField(),
                        level: new foundry.data.fields.NumberField(),
                    }),
                ),
            }),
        });
    }
}
