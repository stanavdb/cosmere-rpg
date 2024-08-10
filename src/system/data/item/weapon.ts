import { Skill } from '@system/types/cosmere';

// Mixins
import { DataModelMixin } from '../mixins';
import { TypedItemMixin, TypedItemData } from './mixins/typed';
import { DescriptionItemMixin, DescriptionItemData } from './mixins/description';
import { EquippableItemMixin, EquippableItemData } from './mixins/equippable';
import { ActivatableItemMixin, ActivatableItemData } from './mixins/activatable';
import { TraitsItemMixin, TraitsItemData } from './mixins/traits';
import { PhysicalItemMixin, PhysicalItemData } from './mixins/physical';

export interface WeaponItemData extends 
    TypedItemData, DescriptionItemData, EquippableItemData, 
    ActivatableItemData, TraitsItemData, PhysicalItemData {
    range?: {
        value?: number;
        long?: number;
        units?: string;
    }
}

export class WeaponItemDataModel extends DataModelMixin(
    TypedItemMixin(),
    DescriptionItemMixin(),
    EquippableItemMixin(),
    ActivatableItemMixin(),
    TraitsItemMixin(),
    PhysicalItemMixin()
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            range: new foundry.data.fields.SchemaField({
                value: new foundry.data.fields.NumberField({ min: 0 }),
                long: new foundry.data.fields.NumberField({ min: 0 }),
                units: new foundry.data.fields.StringField()
            }),
        });
    }
}