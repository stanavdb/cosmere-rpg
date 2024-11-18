import { ItemType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';
import { TalentTree, Talent } from '@system/types/item';

import { TalentTreeNodeCollectionField } from './fields/talent-tree-node-collection';

// Mixins
import { DataModelMixin } from '../mixins';

export interface TalentTreeItemData {
    /**
     * The list of nodes in the tree
     */
    nodes: Collection<TalentTree.Node>;

    /**
     * The available width of the tree
     */
    width: number;

    /**
     * The available height of the tree
     */
    height: number;
}

export class TalentTreeItemDataModel extends DataModelMixin<
    TalentTreeItemData,
    CosmereItem
>() {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            nodes: new TalentTreeNodeCollectionField({
                required: true,
                nullable: false,
                gmOnly: true,
            }),
            width: new foundry.data.fields.NumberField({
                required: true,
                nullable: false,
                gmOnly: true,
                initial: 7,
                min: 3,
                integer: true,
                label: 'COSMERE.Item.TalentTree.Width.Label',
            }),
            height: new foundry.data.fields.NumberField({
                required: true,
                nullable: false,
                gmOnly: true,
                initial: 7,
                min: 3,
                integer: true,
                label: 'COSMERE.Item.TalentTree.Height.Label',
            }),
        });
    }
}
