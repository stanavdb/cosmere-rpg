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
import { DragDropApplicationMixin, EditModeApplicationMixin } from '../mixins';

const { ItemSheetV2 } = foundry.applications.sheets;

// Constants
const ROW_HEIGHT = 65;
const COLUMN_WIDTH = 65;
const HEADER_HEIGHT = 36;
const PADDING = 10;
const DOCUMENT_UUID_REGEX = /@UUID\[.+\]\{(.*)\}/g;

export class TalentTreeItemSheet extends EditModeApplicationMixin(
    DragDropApplicationMixin(ComponentHandlebarsApplicationMixin(ItemSheetV2)),
)<AnyObject> {
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

    private contextMenu?: AppContextMenu;

    private _dragging = false;
    private _draggingNodeId?: string;
    private _contextNodeIds = new Set<string>();

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

    private get dragging(): boolean {
        return this._dragging;
    }

    private set dragging(value: boolean) {
        this._dragging = value;
        $(this.element)
            .find('.grid')
            .css('pointer-events', !value ? 'none' : 'auto');
    }

    private get contextNodes(): TalentTree.Node[] {
        return Array.from(this._contextNodeIds).map(
            (id) => this.item.system.nodes.get(id)!,
        );
    }

    private set draggingNode(value: TalentTree.Node | undefined) {
        this._draggingNodeId = value?.id;
    }

    private get draggingNode(): TalentTree.Node | undefined {
        return this.item.system.nodes.get(this._draggingNodeId!);
    }

    /* --- Drag Drop --- */

    protected override _canDragStart(selector: string): boolean {
        return this.isEditMode;
    }

    protected override _canDragDrop(selector: string): boolean {
        return this.isEditMode;
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
            uuid: node.uuid,
        };

        // Set data transfer
        event.dataTransfer!.setData('text/plain', JSON.stringify(data));
        event.dataTransfer!.setData('document/item', ''); // Mark the type
        event.dataTransfer!.setData('source/talent-tree', this.item.id); // Metadata
        event.dataTransfer!.setData('source/node', node.id); // Metadata

        // Set dragging node
        this.draggingNode = node;
    }

    protected override _onDragOver(event: DragEvent) {
        // Check if dragging over container or slot
        if ($(event.target!).hasClass('container')) {
            if (!this.dragging) {
                this.dragging = true;
            }
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
            uuid: string;
        };

        // Ensure type is correct
        if (data.type !== 'Item') return;

        // Get the item
        const item = (await fromUuid(data.uuid)) as CosmereItem | null;

        // Validate item
        if (!item || !(item.isTalent() || item.isTalentTree())) return;

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
                        uuid: data.uuid,
                        connections: [],
                        position: {
                            row,
                            column,
                        },
                    },
                },
                { render: this.contextNodes.length === 0 },
            );
        } else {
            // Update node position
            await this.item.update({
                [`system.nodes.${nodeId}.position`]: {
                    row,
                    column,
                },
            });
        }

        // If we have a context node, connect the two
        if (this.contextNodes.length > 0) {
            // TODO: Set requirements correctly

            // Connect nodes
            await Promise.all(
                this.contextNodes.map((contextNode) =>
                    this.item.update({
                        [`system.nodes.${contextNode.id}.connections`]: [
                            ...contextNode.connections,
                            nodeId,
                        ],
                    }),
                ),
            );

            // Clear context nodes
            this.clearContextNodes();
        }

        // Reset dragging
        this.dragging = false;
        this.draggingNode = undefined;
    }

    /* --- Lifecycle --- */

    protected override async _renderFrame(
        options: AnyObject,
    ): Promise<HTMLElement> {
        const frame = await super._renderFrame(options);

        // Check if item is on an actor
        const hasActor = !!this.item.actor;

        // Add class
        if (hasActor) frame.classList.add('owned');

        return frame;
    }

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
            })
            .on('dragenter', (event) => {
                // Get element
                const el = $(event.target).closest('.slot');

                // Add dragover class
                el.addClass('dragover');

                if (el.hasClass('empty')) return;

                // Get id
                const id = el.data('id') as string;

                if (this.draggingNode?.id === id) return;

                // Check if node is already in context
                if (!this.hasContextNode(id)) {
                    // Add context node
                    this.addContextNode(id);
                } else {
                    // Remove context node
                    this.removeContextNode(id);
                }
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

            // Bind context menu
            this.contextMenu?.bind(
                ['.slot:not(.empty)', '.connection'],
                MouseButton.Secondary,
            );
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
            items: (element) => [
                {
                    name: 'GENERIC.Button.Remove',
                    icon: 'fa-solid fa-trash',
                    callback: async () => {
                        if ($(element).hasClass('slot')) {
                            // Get id
                            const id = $(element).data('id') as string;

                            // Remove the node (and its connections)
                            this.item.system.nodes.delete(id);

                            // Update
                            void this.item.update({
                                [`system.nodes.-=${id}`]: null,
                            });
                        } else {
                            // Get from and to ids
                            const fromId = $(element).data('from') as string;
                            const toId = $(element).data('to') as string;

                            // Get from node
                            const fromNode = this.item.system.nodes.get(fromId);
                            if (!fromNode) return;

                            // Remove connection
                            fromNode.connections = fromNode.connections.filter(
                                (id) => id !== toId,
                            );

                            // Update
                            await this.item.update({
                                [`system.nodes.${fromId}.connections`]:
                                    fromNode.connections,
                            });

                            // Render
                            void this.render(true);
                        }
                    },
                },
            ],
            anchor: 'cursor',
            mouseButton: MouseButton.Secondary,
        });

        // Set active
        this.contextMenu.setActive(this.isEditMode);
    }

    protected override _onModeChange() {
        super._onModeChange();

        // Update context menu
        this.contextMenu?.setActive(this.isEditMode);
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
            isEditMode: this.isEditMode,
            editable: this.isEditable,

            rows,
            columns,
            cells: await this.prepareCells(rows, columns),
            gridTemplate,
            enrichedDescriptions: await this.prepareNodeDescriptions(),
        };
    }

    private async prepareCells(rows: number, columns: number) {
        const cells = new Array(rows)
            .fill(null)
            .map(() => new Array(columns).fill(null)) as (AnyObject | null)[][];

        await Promise.all(
            this.item.system.nodes.map(async (node) => {
                const nodeData = foundry.utils.deepClone(node);
                cells[node.position.row][node.position.column] = {
                    ...nodeData,
                    item: await fromUuid(node.uuid),
                };
            }),
        );

        return cells;
    }

    private async prepareNodeDescriptions() {
        const descriptions: Record<string, string> = {};

        await Promise.all(
            this.item.system.nodes.map(async (node) => {
                // Look up item
                const item = (await fromUuid(node.uuid)) as CosmereItem | null;
                if (!item?.isTalent()) return;

                // Get html
                let html = await TextEditor.enrichHTML(
                    item.system.description?.value ?? '',
                    {
                        documents: false,
                    },
                );

                // Replace UUIDs
                const matches = [...html.matchAll(DOCUMENT_UUID_REGEX)];
                matches.forEach(
                    (match) => (html = html.replace(match[0], match[1])),
                );

                // Store
                descriptions[node.id] = html;
            }),
        );

        return descriptions;
    }

    /* --- Helpers --- */

    private addContextNode(node: TalentTree.Node): void;
    private addContextNode(nodeId: string): void;
    private addContextNode(param: TalentTree.Node | string): void {
        // Get node id
        const id = typeof param === 'string' ? param : param.id;

        // Add to context
        this._contextNodeIds.add(id);

        // Get element
        const el = $(this.element).find(`.slot[data-id="${id}"]`);

        // Add context class
        el.addClass('context');
    }

    private removeContextNode(node: TalentTree.Node): void;
    private removeContextNode(nodeId: string): void;
    private removeContextNode(param: TalentTree.Node | string): void {
        // Get node id
        const id = typeof param === 'string' ? param : param.id;

        // Remove from context
        this._contextNodeIds.delete(id);

        // Get element
        const el = $(this.element).find(`.slot[data-id="${id}"]`);

        // Remove context class
        el.removeClass('context');
    }

    private clearContextNodes() {
        // Clear context class
        $(this.element).find('.slot.context').removeClass('context');

        // Clear context nodes
        this._contextNodeIds.clear();
    }

    private hasContextNode(nodeId: string): boolean {
        return this._contextNodeIds.has(nodeId);
    }

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
            `<div class="connection" data-from="${fromNode.id}" data-to="${toNode.id}"><i class="fa-solid fa-angle-right"></i></div>`,
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
