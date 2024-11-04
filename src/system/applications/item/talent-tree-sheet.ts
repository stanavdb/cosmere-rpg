import { ItemType } from '@system/types/cosmere';
import { TalentTree } from '@system/types/item';
import {
    CosmereItem,
    TalentItem,
    TalentTreeItem,
} from '@system/documents/item';
import { AnyObject, DeepPartial, MouseButton } from '@system/types/utils';
import { SYSTEM_ID } from '@src/system/constants';

// Context menu
import { AppContextMenu } from '@system/applications/utils/context-menu';

// Mixins
import { ComponentHandlebarsApplicationMixin } from '@system/applications/component-system';
import { DragDropApplicationMixin } from '../mixins';
import HandlebarsApplicationMixin from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/applications/api/handlebars-application.mjs';

const { ItemSheetV2 } = foundry.applications.sheets;

// Constants
const ROW_HEIGHT = 65;
const COLUMN_WIDTH = 65;
const HEADER_HEIGHT = 36;
const PADDING = 10;

export class TalentTreeItemSheet extends DragDropApplicationMixin(
    ComponentHandlebarsApplicationMixin(ItemSheetV2),
)<AnyObject> {
    /**
     * NOTE: Unbound methods is the standard for defining actions and forms
     * within ApplicationV2
     */

    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            classes: [SYSTEM_ID, 'sheet', 'item', 'talent-tree'],
            window: {
                positioned: true,
            },
            dragDrop: [
                {
                    dropSelector: '.container',
                },
                {
                    dragSelector: '.slot:not(.empty)',
                    dropSelector: '.slot.empty',
                },
            ],
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            'sheet-content': {
                template:
                    'systems/cosmere-rpg/templates/item/talent-tree/parts/sheet-content.hbs',
            },
        },
    );

    private _dragging = false;
    private contextMenu?: AppContextMenu;

    constructor(
        options: foundry.applications.api.DocumentSheetV2.Configuration,
    ) {
        const tree = options.document as unknown as TalentTreeItem;

        super(
            foundry.utils.mergeObject(options, {
                window: {
                    title: tree.name,
                },
                position: {
                    width: tree.system.width * COLUMN_WIDTH + PADDING * 2,
                    height:
                        tree.system.height * ROW_HEIGHT +
                        HEADER_HEIGHT +
                        PADDING * 2,
                },
            }),
        );
    }

    /* --- Accessors --- */

    get item(): TalentTreeItem {
        return super.document;
    }

    get latestNode(): TalentTree.Node | null {
        const id: string = this.item.getFlag(SYSTEM_ID, 'latestNode');
        if (!id) return null;
        return this.item.system.nodes.get(id) ?? null;
    }

    private get dragging(): boolean {
        return this._dragging;
    }

    private set dragging(value: boolean) {
        this._dragging = value;
        $(this.element)
            .find('.grid')
            .css('pointer-events', !value ? 'none' : 'auto');
    }

    /* --- Drag Drop --- */

    protected override _canDragStart(selector: string): boolean {
        return true;
    }

    protected override _canDragDrop(selector: string): boolean {
        return true;
    }

    protected override _onDragStart(event: DragEvent) {
        // Hide context menu
        this.contextMenu?.hide();

        // Get slot element
        const slot = $(event.target!).closest('.slot');

        // Get id
        const id = slot.data('id') as string;

        // Get node
        const node = this.item.system.nodes.get(id);
        if (!node) return;

        // Prepare data
        const data = {
            type: 'Item',
            data: node.item,
        };

        // Set data transfer
        event.dataTransfer!.setData('text/plain', JSON.stringify(data));
        event.dataTransfer!.setData('isEmbedded', ''); // Mark type
        event.dataTransfer!.setData('source/talent-tree', this.item.id); // Metadata
        event.dataTransfer!.setData('source/node', node.id); // Metadata
    }

    protected override _onDragOver(event: DragEvent) {
        // Check if dragging over container or slot
        if ($(event.target!).hasClass('container')) {
            if (!this.dragging) {
                this.dragging = true;
            }
        } else {
            // Get element
            const el = $(event.target!).closest('.slot');

            // Add dragover class
            el.addClass('dragover');
        }
    }

    protected override async _onDrop(event: DragEvent) {
        if ($(event.target!).hasClass('container')) return;

        event.stopImmediatePropagation();

        // Hide context menu
        this.contextMenu?.hide();

        // Get element
        const slotEl = $(event.target!).closest('.slot');

        // Ensure cell element was found
        if (!slotEl.length) return;

        // Remove dragover class
        slotEl.removeClass('dragover');

        // Get cell element
        const cellEl = slotEl.closest('.cell');

        const data = TextEditor.getDragEventData(event) as unknown as {
            type: string;
        } & ({ uuid: string } | { data: TalentItem | TalentTreeItem });

        // Ensure type is correct
        if (data.type !== 'Item') return;

        // Get object
        const object: TalentItem | TalentTreeItem =
            'uuid' in data
                ? ((
                      (await fromUuid(data.uuid)) as unknown as CosmereItem
                  ).toObject() as TalentItem | TalentTreeItem)
                : data.data;

        // Ensure object type is correct
        if (
            object.type !== ItemType.Talent &&
            object.type !== ItemType.TalentTree
        )
            return;

        // Get target cell position
        const row = cellEl.data('row') as number;
        const column = cellEl.data('column') as number;

        // Check if we should create a new node
        const shouldCreateNode =
            !event.dataTransfer!.types.includes('source/node');

        // Get node id (create new one if this isn't an existing node)
        const nodeId =
            event.dataTransfer!.getData('source/talent-tree') ===
                this.item.id &&
            event.dataTransfer!.types.includes('source/node')
                ? event.dataTransfer!.getData('source/node')
                : foundry.utils.randomID();

        if (shouldCreateNode) {
            // Create new node
            await this.item.update(
                {
                    [`system.nodes.${nodeId}`]: {
                        id: nodeId,
                        type: TalentTree.Node.Type.Icon,
                        item: object,
                        connections: [],
                        position: {
                            row,
                            column,
                        },
                    },
                },
                { render: !this.latestNode },
            );

            // TODO: Set requirements correctly

            // Create connection from latest node
            if (this.latestNode) {
                await this.item.update({
                    [`system.nodes.${this.latestNode.id}.connections`]: [
                        ...this.latestNode.connections,
                        nodeId,
                    ],
                });
            }
        } else {
            // Update node position
            await this.item.update({
                [`system.nodes.${nodeId}.position`]: {
                    row,
                    column,
                },
            });
        }

        // Mark latest node
        void this.item.setFlag(SYSTEM_ID, 'latestNode', nodeId);

        // Reset dragging
        this.dragging = false;
    }

    /* --- Lifecycle --- */

    protected override _onRender(context: AnyObject, options: AnyObject) {
        super._onRender(context, options);

        // Bind dragleave event
        $(this.element)
            .find('.container')
            .on('dragleave', (event) => {
                // Check if target element is child of the container
                if ($(event.target).closest('.container').length) return;

                this.dragging = false;
            });

        $(this.element)
            .find('.slot')
            .on('dragleave', (event) => {
                // Get element
                const el = $(event.target).closest('.slot');

                // Remove dragover class
                el.removeClass('dragover');
            });

        $(this.element).on('click', (event) => {
            // Ensure event didn't originate from context menu element
            if (
                this.contextMenu?.element &&
                $(this.contextMenu.element).has(event.target).length
            )
                return;

            // Hide context menu
            this.contextMenu?.hide();
        });

        setTimeout(() => {
            // Render connections
            this.renderConnections();
        });
    }

    protected override async _preFirstRender(
        context: AnyObject,
        options: AnyObject,
    ) {
        await super._preFirstRender(context, options);

        // Create context menu
        this.contextMenu ??= AppContextMenu.create({
            parent: this,
            items: [
                {
                    name: 'GENERIC.Button.Remove',
                    icon: 'fa-solid fa-trash',
                    callback: (element) => {
                        // Get id
                        const id = $(element).data('id') as string;

                        // Remove the node (and its connections)
                        this.item.system.nodes.delete(id);

                        // Update
                        void this.item.update({
                            [`system.nodes.-=${id}`]: null,
                        });
                    },
                },
            ],
            selectors: ['.slot:not(.empty)'],
            anchor: 'cursor',
            mouseButton: MouseButton.Secondary,
        });
    }

    /* --- Context --- */

    public async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        const rows = this.item.system.height;
        const columns = this.item.system.width;

        // Prepare grid template data
        const gridTemplate = {
            columns: `${(100 / columns).toFixed(3)}% `.repeat(columns).trim(),
        };

        return {
            ...(await super._prepareContext(options)),
            item: this.item,
            rows,
            columns,
            cells: this.prepareCells(rows, columns),
            gridTemplate,
        };
    }

    private prepareCells(rows: number, columns: number) {
        const cells = new Array(rows)
            .fill(null)
            .map(() =>
                new Array(columns).fill(null),
            ) as (TalentTree.Node | null)[][];

        this.item.system.nodes.forEach((node) => {
            cells[node.position.row][node.position.column] = node;
        });

        return cells;
    }

    /* --- Helpers --- */

    private renderConnections() {
        this.item.system.nodes
            .filter((node) => node.connections.length > 0)
            .forEach((node) =>
                node.connections.forEach((connectionId) => {
                    // Get connected node
                    const connectedNode =
                        this.item.system.nodes.get(connectionId);
                    if (!connectedNode) return;

                    this.renderConnection(node, connectedNode);
                }),
            );
    }

    private renderConnection(
        fromNode: TalentTree.Node,
        toNode: TalentTree.Node,
    ) {
        // Get container element
        const container = $(this.element).find('.container');

        // Get connections element
        const connections = container.find('.connections');

        // Get grid positions
        const startPos = fromNode.position;
        const endPos = toNode.position;

        // Get elements
        const startEl = $(this.element).find(
            `[data-row="${startPos.row}"][data-column="${startPos.column}"]`,
        );
        const endEl = $(this.element).find(
            `[data-row="${endPos.row}"][data-column="${endPos.column}"]`,
        );

        // Get true positions
        const start = {
            x:
                startEl.offset()!.left -
                container.offset()!.left +
                startEl.width()! / 2,
            y:
                startEl.offset()!.top -
                container.offset()!.top +
                startEl.height()! / 2,
        };
        const end = {
            x:
                endEl.offset()!.left -
                container.offset()!.left +
                endEl.width()! / 2,
            y:
                endEl.offset()!.top -
                container.offset()!.top +
                endEl.height()! / 2,
        };

        // Calculate angle
        const angle = Math.atan2(end.y - start.y, end.x - start.x);

        // Calculate distance
        const distance = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2),
        );

        // Create connection
        const connection = $(
            `<div class="connection"><i class="fa-solid fa-angle-right"></i></div>`,
        );

        // Set position
        connection.css({
            position: 'absolute',
            left: start.x,
            top: start.y,
        });

        // Set size
        connection.width(distance);

        // Set angle
        connection.css('transform', `rotate(${angle}rad)`);

        // Append to connections
        connections.append(connection);
    }
}
