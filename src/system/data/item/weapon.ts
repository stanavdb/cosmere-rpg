import { WeaponId } from '@system/types/cosmere';

// Mixins
import { DataModelMixin } from '../mixins';
import { TypedItemMixin, TypedItemData } from './mixins/typed';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';
import { EquippableItemMixin, EquippableItemData } from './mixins/equippable';
import {
    ActivatableItemMixin,
    ActivatableItemData,
} from './mixins/activatable';
import { DamagingItemMixin, DamagingItemData } from './mixins/damaging';
import { TraitsItemMixin, TraitsItemData } from './mixins/traits';
import { PhysicalItemMixin, PhysicalItemData } from './mixins/physical';
import { ExpertiseItemMixin, ExpertiseItemData } from './mixins/expertise';

export interface WeaponItemData
    extends TypedItemData<WeaponId>,
        DescriptionItemData,
        EquippableItemData,
        ActivatableItemData,
        DamagingItemData,
        TraitsItemData,
        PhysicalItemData,
        ExpertiseItemData {
    range?: {
        value?: number;
        long?: number;
        units?: string;
    };
}

export class WeaponItemDataModel extends DataModelMixin(
    TypedItemMixin(),
    DescriptionItemMixin(),
    EquippableItemMixin(),
    ActivatableItemMixin(),
    DamagingItemMixin(),
    TraitsItemMixin(),
    PhysicalItemMixin(),
    ExpertiseItemMixin(),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            range: new foundry.data.fields.SchemaField({
                value: new foundry.data.fields.NumberField({ min: 0 }),
                long: new foundry.data.fields.NumberField({ min: 0 }),
                units: new foundry.data.fields.StringField(),
            }),
        });
    }
}
