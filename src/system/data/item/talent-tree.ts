import { ItemType } from '@system/types/cosmere';
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

        // Get item
        const item = this.parent;

        // Get actor
        const actor = item.actor;

        // Get list of all unique connections
        const connections = new Set<string>(
            this.nodes.map((node) => node.connections).flat(),
        );

        // Process nodes
        this.nodes.forEach((node) => {
            // Check if the node is a root node
            node.isRoot = !connections.has(node.id);

            // Look up the item for the node
            const item = fromUuidSync(node.uuid) as CosmereItem | null;

            if (actor && item && item.type === ItemType.Talent) {
                // Check if the node's item has been obtained
                node.obtained = actor.items.some(
                    (item) => item.isTalent() && item.system.id === item.id,
                );
            } else {
                node.obtained = null;
            }
        });
    }
}
