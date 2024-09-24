import { Size, CreatureType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';

// Mixins
import { DataModelMixin } from '../mixins';
import { IdItemMixin, IdItemData } from './mixins/id';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';

export interface AncestryItemData extends IdItemData, DescriptionItemData {
    size: Size;
    type: {
        id: CreatureType;
        custom?: string | null;
        subtype?: string | null;
    };
}

export class AncestryItemDataModel extends DataModelMixin<
    AncestryItemData,
    CosmereItem
>(
    IdItemMixin({
        initial: 'none',
    }),
    DescriptionItemMixin(),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            // TODO: Advancements

            size: new foundry.data.fields.StringField({
                required: true,
                nullable: false,
                blank: false,
                initial: Size.Medium,
                choices: Object.keys(CONFIG.COSMERE.sizes),
            }),
            type: new foundry.data.fields.SchemaField({
                id: new foundry.data.fields.StringField({
                    required: true,
                    nullable: false,
                    blank: false,
                    initial: CreatureType.Humanoid,
                    choices: Object.keys(CONFIG.COSMERE.creatureTypes),
                }),
                custom: new foundry.data.fields.StringField({ nullable: true }),
                subtype: new foundry.data.fields.StringField({
                    nullable: true,
                }),
            }),
        });
    }
}
