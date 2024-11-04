import { TalentItem, TalentTreeItem } from '@system/documents/item';

export namespace Node {
    export const enum Type {
        Talent = 'talent',
        Tree = 'tree',
    }
}

interface BaseNode<T extends Node.Type = Node.Type> {
    /**
     * Unique identifier for the node
     */
    id: string;

    /**
     * Node type
     */
    type: T;

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

export interface TalentNode extends BaseNode<Node.Type.Talent> {
    /**
     * Embedded talent item
     */
    item: TalentItem;
}

export interface TreeNode extends BaseNode<Node.Type.Tree> {
    /**
     * Embedded talent item
     */
    item: TalentTreeItem;
}

export type Node = TalentNode | TreeNode;
