import { TalentItem, TalentTreeItem } from '@system/documents/item';

export namespace Node {
    // TODO: Clean up
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
     * The UUID of the item the node refers to
     */
    uuid: string;

    /**
     * Position to render the node in the tree
     */
    position: {
        row: number;
        column: number;
    };
}
