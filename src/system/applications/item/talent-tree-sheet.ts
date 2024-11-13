import { Talent, TalentTree } from '@system/types/item';
import {
    CosmereItem,
    TalentItem,
    TalentTreeItem,
} from '@system/documents/item';
import { CosmereActor } from '@system/documents/actor';
import { AnyObject, DeepPartial, MouseButton } from '@system/types/utils';
import { SYSTEM_ID } from '@src/system/constants';

// Context menu
import { AppContextMenu } from '@system/applications/utils/context-menu';

// Mixins
import { ComponentHandlebarsApplicationMixin } from '@system/applications/component-system';
import { DragDropApplicationMixin, EditModeApplicationMixin } from '../mixins';

// Dialogs
import { ConfigureTalentTreeDialog } from '@system/applications/item/dialogs/talent-tree/configure-talent-tree';

const { ItemSheetV2 } = foundry.applications.sheets;

// Constants
const ROW_HEIGHT = 65;
const COLUMN_WIDTH = 65;
const HEADER_HEIGHT = 36;
const PADDING = 10;
const DOCUMENT_UUID_REGEX = /@UUID\[.+\]\{(.*)\}/g;

interface ExtendedNode extends TalentTree.Node {
    item: TalentItem;
    obtained: boolean;
    available: boolean;
}

export class TalentTreeItemSheet extends EditModeApplicationMixin(
    DragDropApplicationMixin(ComponentHandlebarsApplicationMixin(ItemSheetV2)),
)<AnyObject> {
    /**
     * NOTE: Unbound methods is the standard for defining actions and forms
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            classes: [SYSTEM_ID, 'sheet', 'item', 'talent-tree'],
            window: {
                positioned: true,
                resizable: false,
            },
            actions: {
                configure: this.onConfigure,
                'pick-talent': this.onPickTalent,
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
    /* eslint-enable @typescript-eslint/unbound-method */

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

    private _contextActor?: CosmereActor;
    private _dragging = false;
    private _draggingNodeId?: string;
    private _contextNodeIds = new Set<string>();

    private nodes = new Collection<ExtendedNode>();

    constructor(
        options: foundry.applications.api.DocumentSheetV2.Configuration,
    ) {
        const tree = options.document as unknown as TalentTreeItem;

        super(
            foundry.utils.mergeObject(options, {
                window: {
                    title: tree.name,
                },
                position: calculatePosition(tree),
            }),
        );

        // Get all characters owned by the current user
        const characters = (game.actors as CosmereActor[]).filter(
            (actor) =>
                actor.isCharacter() &&
                actor.testUserPermission(
                    game.user as unknown as foundry.documents.BaseUser,
                    'OWNER',
                ),
        );

        // Get user character
        const userCharacter = game.user!.character as CosmereActor | undefined;

        if (userCharacter || characters.length === 1)
            this.contextActor = userCharacter ?? characters[0];
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

    private set contextActor(actor: CosmereActor | undefined) {
        if (actor !== this._contextActor) {
            if (this._contextActor) {
                delete this._contextActor.apps[this.id];
            }
        }

        this._contextActor = actor;

        if (actor) {
            $(this.element).addClass('actor-selected');

            // Register this sheet with the actor
            actor.apps[this.id] = this;
        } else {
            $(this.element).removeClass('actor-selected');
        }
    }

    private get contextActor(): CosmereActor | undefined {
        return this._contextActor;
    }

    /* --- Actions --- */

    private static async onConfigure(this: TalentTreeItemSheet) {
        if (await ConfigureTalentTreeDialog.show(this.item)) {
            // Update position
            foundry.utils.mergeObject(
                this.position,
                calculatePosition(this.item),
            );

            // Close and re-open
            await this.close();

            // Re-render
            void this.render(true);
        }
    }

    private static async onPickTalent(this: TalentTreeItemSheet, event: Event) {
        event.preventDefault();

        // Get slot element
        const slotEl = $(event.target!).closest('.slot');

        // Get id
        const id = slotEl.data('id') as string;

        // Get node
        const node = this.nodes.get(id);
        if (!node) return;

        // Ensure node is available
        if (!node.available) return;

        // Get item
        const item = node.item;

        // Add item to context actor
        await this.contextActor!.createEmbeddedDocuments('Item', [
            item.toObject(),
        ]);

        // Create notification
        ui.notifications.info(
            game.i18n!.format(
                'DIALOG.ConfigureTalentTree.Notification.TalentPicked',
                {
                    talent: item.name,
                    actor: this.contextActor!.name,
                },
            ),
        );

        // Render
        void this.render(true);
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

        try {
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
            if (!item?.isTalent()) return;

            // Get the item ids for all the nodes in the tree
            const itemIds = (
                await Promise.all(
                    this.item.system.nodes.map(async (node) => {
                        const item = (await fromUuid(
                            node.uuid,
                        )) as CosmereItem | null;
                        return item?.system.id;
                    }),
                )
            ).filter((id) => !!id);

            // Ensure the item isn't already present in the tree
            if (itemIds.includes(item.system.id) && !this.draggingNode) {
                return ui.notifications.warn(
                    game.i18n!.format('GENERIC.Warning.ItemAlreadyInTree', {
                        itemId: item.system.id,
                        name: this.item.name,
                    }),
                );
            }

            // Get target cell position
            const row = cellEl.data('row') as number;
            const column = cellEl.data('column') as number;

            // Ensure position is valid
            if (row < 0 || row >= this.item.system.height) return;
            if (column < 0 || column >= this.item.system.width) return;

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
                    { render: false },
                );
            } else {
                // Update node position
                await this.item.update(
                    {
                        [`system.nodes.${nodeId}.position`]: {
                            row,
                            column,
                        },
                    },
                    { render: false },
                );
            }

            // Check if user can modify the item
            const hasPermission = item.testUserPermission(
                game.user as unknown as foundry.documents.BaseUser,
                CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
            );

            // Check if the item isn't part of a locked compendium
            const inLockedCompendium = item.compendium?.locked ?? false;

            // If we have a context node, connect the two
            if (
                hasPermission &&
                !inLockedCompendium &&
                this.contextNodes.length > 0
            ) {
                // Look up context items
                const contextItems = (
                    await Promise.all(
                        this.contextNodes.map(
                            async (node) =>
                                (await fromUuid(
                                    node.uuid,
                                )) as CosmereItem | null,
                        ),
                    )
                ).filter((item) => !!item && item.isTalent());

                // Get item talent prerequisites
                const talentPrerequisites =
                    item.system.prerequisitesArray.filter(
                        (prerequisite) =>
                            prerequisite.type ===
                            Talent.Prerequisite.Type.Talent,
                    );

                // Find an "Any Of" rule
                let anyOfRule = talentPrerequisites.find(
                    (rule) =>
                        rule.mode === Talent.Prerequisite.Mode.AnyOf ||
                        (rule.talents.length === 1 && !rule.mode),
                );

                // If there isn't one, create it
                if (!anyOfRule) {
                    anyOfRule = {
                        id: foundry.utils.randomID(),
                        type: Talent.Prerequisite.Type.Talent,
                        mode: Talent.Prerequisite.Mode.AnyOf,
                        talents: [],
                    };

                    // Update the item
                    await item.update(
                        {
                            [`system.prerequisites.${anyOfRule.id}`]: anyOfRule,
                        },
                        { render: false },
                    );
                }

                // Add the context items to the rule
                anyOfRule.talents.push(
                    ...contextItems.map((item) => ({
                        id: item.system.id,
                        uuid: item.uuid,
                        label: item.name,
                    })),
                );

                // Update the rule
                await item.update(
                    {
                        [`system.prerequisites.${anyOfRule.id}`]: anyOfRule,
                    },
                    { diff: false },
                );

                // Clear context nodes
                this.clearContextNodes();
            }

            // Bind to item if it's a new node
            if (!this.draggingNode) {
                item.apps[this.id] = this;
            }
        } finally {
            // Reset dragging
            this.dragging = false;
            this.draggingNode = undefined;

            // Render
            void this.render(true);
        }
    }

    /* --- Lifecycle --- */

    protected _getHeaderControls(): foundry.applications.api.ApplicationV2.HeaderControlsEntry[] {
        const controls = super._getHeaderControls();

        if (!controls.some((control) => control.action === 'configure')) {
            // Add edit button
            controls.unshift({
                action: 'configure',
                label: 'GENERIC.Configure',
                icon: 'fa-solid fa-edit',
                ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
            });
        }

        return controls;
    }

    protected override async _renderFrame(
        options: AnyObject,
    ): Promise<HTMLElement> {
        const frame = await super._renderFrame(options);

        // Get all characters owned by the current user
        const characters = (game.actors as CosmereActor[]).filter(
            (actor) =>
                actor.isCharacter() &&
                actor.testUserPermission(
                    game.user as unknown as foundry.documents.BaseUser,
                    'OWNER',
                ),
        );

        // Get user character
        const userCharacter = game.user!.character as CosmereActor | undefined;

        if (characters.length > 1) {
            $(this.window.title!).after(`
                <div class="actor-select">
                    <label>${game.i18n!.localize('Actor')}</label>
                    <select>
                        <option value="none" ${!userCharacter ? 'selected' : ''}>${game.i18n!.localize('GENERIC.None')}</option>
                        ${characters
                            .map(
                                (actor) => `
                                <option value="${actor.id}" ${userCharacter?.id === actor.id ? 'selected' : ''}>
                                    ${actor.name}
                                </option>
                            `,
                            )
                            .join('\n')}
                    </select>
                </div>
            `);
        }

        // Bind to select
        $(this.window.title!)
            .parent()
            .find('.actor-select select')
            .on('change', (event) => {
                // Get selected actor
                const actorId = $(event.target).val() as string;

                // Get actor
                const actor =
                    actorId === 'none'
                        ? undefined
                        : (game.actors as Collection<CosmereActor>).get(
                              actorId,
                          );

                // Set context actor
                this.contextActor = actor;

                // Render
                void this.render(true);
            });

        if (this.contextActor) {
            $(frame).addClass('actor-selected');
        }

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

        setTimeout(async () => {
            // Render connections
            await this.renderConnections();

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

        // Bind to items
        await Promise.all(
            this.item.system.nodes.map(async (node) => {
                // Get item
                const item = (await fromUuid(node.uuid)) as CosmereItem | null;
                if (!item) return;

                item.apps[this.id] = this;
            }),
        );

        // Create context menu
        this.contextMenu ??= AppContextMenu.create({
            parent: this,
            items: (element) => [
                ...($(element).hasClass('slot')
                    ? [
                          {
                              name: 'GENERIC.Button.Edit',
                              icon: 'fa-solid fa-edit',
                              callback: async () => {
                                  // Get id
                                  const id = $(element).data('id') as string;

                                  // Get node
                                  const node = this.item.system.nodes.get(id);
                                  if (!node) return;

                                  // Get item
                                  const item = (await fromUuid(
                                      node.uuid,
                                  )) as CosmereItem | null;
                                  if (!item) return;

                                  // Edit the item
                                  item.sheet?.render(true);
                              },
                          },
                      ]
                    : []),

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

                            // Get from nodes
                            const toNode = this.item.system.nodes.get(toId);
                            const fromNode = this.item.system.nodes.get(fromId);
                            if (!toNode || !fromNode) return;

                            // Get items
                            const fromItem = (await fromUuid(
                                fromNode.uuid,
                            )) as CosmereItem | null;
                            const toItem = (await fromUuid(
                                toNode.uuid,
                            )) as CosmereItem | null;
                            if (!fromItem || !toItem) return;
                            if (!fromItem.isTalent() || !toItem.isTalent())
                                return;

                            // Get talent prerequisites
                            const talentPrerequisites =
                                toItem.system.prerequisitesArray.filter(
                                    (prerequisite) =>
                                        prerequisite.type ===
                                        Talent.Prerequisite.Type.Talent,
                                );

                            // Find the prerequisite rule that requires the from node talent
                            const ruleIndex = talentPrerequisites.findIndex(
                                (rule) =>
                                    rule.talents.some(
                                        (ref) => ref.id === fromItem.system.id,
                                    ),
                            );

                            // Get the rule
                            const rule = talentPrerequisites[ruleIndex];

                            // Remove the talent from the rule
                            rule.talents = rule.talents.filter(
                                (ref) => ref.id !== fromItem.system.id,
                            );

                            // If the rule is now empty, remove it
                            if (rule.talents.length === 0) {
                                await toItem.update({
                                    [`system.prerequisites.-=${rule.id}`]: null,
                                });
                            } else {
                                await toItem.update({
                                    [`system.prerequisites.${rule.id}.talents`]:
                                        rule.talents,
                                });
                            }

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

    protected override _onClose(options?: AnyObject) {
        super._onClose(options);

        // Unbind from context actor
        if (this.contextActor) {
            delete this.contextActor.apps[this.id];
        }

        // Unbind from items
        this.item.system.nodes.forEach(async (node) => {
            const item = (await fromUuid(node.uuid)) as CosmereItem | null;
            if (!item) return;

            delete item.apps[this.id];
        });

        // Destroy context menu
        this.contextMenu?.destroy();
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

        // Extend node data
        await this.extendNodeData();

        return {
            ...(await super._prepareContext(options)),
            item: this.item,
            isEditMode: this.isEditMode,
            editable: this.isEditable,

            rows,
            columns,
            cells: this.prepareCells(rows, columns),
            gridTemplate,
            enrichedDescriptions: await this.prepareNodeDescriptions(),
        };
    }

    private prepareCells(rows: number, columns: number) {
        const cells = new Array(rows)
            .fill(null)
            .map(() =>
                new Array(columns).fill(null),
            ) as (ExtendedNode | null)[][];

        this.nodes.forEach((node) => {
            cells[node.position.row][node.position.column] = node;
        });

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

    private async renderConnections() {
        // Get connections
        const connections = await this.getConnections();

        // Render connections
        this.nodes
            .filter(
                (node) =>
                    connections.has(node.id) &&
                    connections.get(node.id)!.size > 0,
            )
            .forEach((node) =>
                connections.get(node.id)!.forEach((connectionId) => {
                    // Get connected node
                    const connectedNode = this.nodes.get(connectionId);
                    if (!connectedNode) return;

                    this.renderConnection(node, connectedNode);
                }),
            );
    }

    private renderConnection(fromNode: ExtendedNode, toNode: ExtendedNode) {
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

        // Add available class
        if (fromNode.obtained && toNode.available) {
            connection.addClass('available');
        }

        // Add obtained class
        if (fromNode.obtained && toNode.obtained) {
            connection.addClass('obtained');
        }

        // Append to connections
        connections.append(connection);
    }

    private async getConnections(): Promise<Map<string, Set<string>>> {
        // Get the nodes
        const nodes = this.nodes;

        // Prepare nodes id map
        const nodeIdMap = new Map<string, string>(); // Maps item system id to node id

        // Prepare connections
        const connections = new Map<string, Set<string>>();

        // Process nodes
        await Promise.all(
            nodes.map(async (node) => {
                // Get item
                const item = (await fromUuid(node.uuid)) as CosmereItem | null;
                if (!item?.isTalent()) return;

                // Set node id
                nodeIdMap.set(item.system.id, node.id);

                // Get talent prerequisites
                const talentPrerequisites =
                    item.system.prerequisitesArray.filter(
                        (prerequisite) =>
                            prerequisite.type ===
                            Talent.Prerequisite.Type.Talent,
                    );

                // Process prerequisites
                await Promise.all(
                    talentPrerequisites.map(async (rule) => {
                        // Get required talents
                        const requiredTalents = (
                            await Promise.all(
                                rule.talents.map(
                                    async (ref) =>
                                        fromUuid(
                                            ref.uuid,
                                        ) as Promise<TalentItem | null>,
                                ),
                            )
                        ).filter((v) => !!v);

                        // Set connections
                        requiredTalents.forEach((talent) => {
                            const talentConnections =
                                connections.get(talent.system.id) ??
                                connections
                                    .set(talent.system.id, new Set())
                                    .get(talent.system.id)!;

                            talentConnections.add(item.system.id);
                        });
                    }),
                );
            }),
        );

        // Convert system ids to node ids
        return new Map(
            Array.from(connections.entries())
                .filter(([id]) => nodeIdMap.has(id))
                .map(([id, nodeItemIds]) => {
                    // Look up node id
                    const nodeId = nodeIdMap.get(id)!;

                    // Look up connected node ids
                    const nodeIds = new Set(
                        Array.from(nodeItemIds).map((id) => nodeIdMap.get(id)!),
                    );

                    // Return
                    return [nodeId, nodeIds] as [string, Set<string>];
                }),
        );
    }

    private async extendNodeData(): Promise<void> {
        this.nodes = new Collection(
            (
                await Promise.all(
                    this.item.system.nodes.map(async (node) => {
                        // Get item
                        const item = (await fromUuid(
                            node.uuid,
                        )) as TalentItem | null;
                        if (!item) return null;

                        // Check if the context actor has the talent
                        const obtained =
                            this.contextActor?.hasTalent(item.system.id) ??
                            false;

                        // Check if the context actor can obtain the talent
                        const available =
                            !obtained &&
                            (this.contextActor?.hasTalentPrerequisites(item) ??
                                false);

                        return [
                            node.id,
                            {
                                ...node,
                                item,
                                obtained,
                                available,
                            },
                        ] as [string, ExtendedNode];
                    }),
                )
            ).filter((v) => !!v),
        );
    }
}

function calculatePosition(tree: TalentTreeItem) {
    return {
        width: tree.system.width * COLUMN_WIDTH + PADDING * 2,
        height: tree.system.height * ROW_HEIGHT + HEADER_HEIGHT + PADDING * 2,
    };
}
