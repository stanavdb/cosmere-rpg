import { ArmorId } from '@system/types/cosmere';

// Mixins
import { DataModelMixin } from '../mixins';
import { TypedItemMixin, TypedItemData } from './mixins/typed';
import { DescriptionItemMixin, DescriptionItemData } from './mixins/description';
import { EquippableItemMixin, EquippableItemData } from './mixins/equippable';
import { TraitsItemMixin, TraitsItemData } from './mixins/traits';
import { PhysicalItemMixin, PhysicalItemData } from './mixins/physical';
import { ExpertiseItemMixin, ExpertiseItemData } from './mixins/expertise';

export interface ArmorItemData extends 
    TypedItemData<ArmorId>, DescriptionItemData, EquippableItemData, 
    TraitsItemData, PhysicalItemData, ExpertiseItemData {
    deflect?: number;
}

// NOTE: Empty interface is used to merge definitions here,
// which is used to merge schema properties onto data model
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging
export interface ArmorItemDataModel extends ArmorItemData {}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class ArmorItemDataModel extends DataModelMixin(
    TypedItemMixin(),
    DescriptionItemMixin(),
    EquippableItemMixin(),
    TraitsItemMixin(),
    PhysicalItemMixin(),
    ExpertiseItemMixin()
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            deflect: new foundry.data.fields.NumberField({ min: 0 })
        });
    }
}