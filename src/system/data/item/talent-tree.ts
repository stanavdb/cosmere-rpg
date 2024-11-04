import { CosmereItem } from '@system/documents';
import { TalentTree } from '@system/types/item';

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
            }),
            height: new foundry.data.fields.NumberField({
                required: true,
                nullable: false,
                gmOnly: true,
                initial: 7,
            }),
        });
    }

    public override prepareDerivedData() {
        super.prepareDerivedData();

        // Get list of all unique connections
        const connections = new Set<string>(
            this.nodes.map((node) => node.connections).flat(),
        );

        // Process nodes
        this.nodes.forEach((node) => (node.isRoot = !connections.has(node.id)));
    }
}
