import { TalentItem, TalentTreeItem } from '@system/documents/item';

export namespace Node {
    export const enum Type {
        Icon = 'icon',
        Text = 'text',
    }
}

export interface Node {
    /**
     * Unique identifier for the node
     */
    id: string;

    /**
     * Node type
     */
    type: Node.Type;

    /**
     * Embedded item
     */
    item: TalentItem | TalentTreeItem;

    /**
     * Connections to other nodes in the tree
     */
    connections: string[];

    /**
     * Position to render the node in the tree
     */
    position: {
        row: number;
        column: number;
    };

    /**
     * Derived field indicating if the node is at the root of the tree
     */
    isRoot?: boolean;
}
