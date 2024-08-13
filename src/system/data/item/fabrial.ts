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
import { PhysicalItemMixin, PhysicalItemData } from './mixins/physical';

export interface FarbialItemData
    extends TypedItemData,
        DescriptionItemData,
        ActivatableItemData,
        DamagingItemData,
        PhysicalItemData {
    charges: {
        value?: number;
        max?: number;
    };
}

export class FabrialItemDataModel extends DataModelMixin(
    TypedItemMixin(),
    DescriptionItemMixin(),
    ActivatableItemMixin(),
    DamagingItemMixin(),
    PhysicalItemMixin(),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            charge: new foundry.data.fields.SchemaField({
                value: new foundry.data.fields.NumberField({
                    min: 0,
                    initial: 0,
                }),
                max: new foundry.data.fields.NumberField(),
            }),
        });
    }
}
