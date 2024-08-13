// Mixins
import { DataModelMixin } from '../mixins';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TraitItemData extends DescriptionItemData {}

/**
 * Item data model that represents adversary traits.
 * Not to be confused with weapon & armor traits
 */
export class TraitItemDataModel extends DataModelMixin(DescriptionItemMixin()) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {});
    }
}
