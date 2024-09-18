import { ActionType, ItemType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents/item';
import { ActionItemDataModel, ActionItemData } from '@system/data/item';
import { ConstructorOf } from '@system/types/utils';

import { AppContextMenu } from '@system/applications/utils/context-menu';

// Utils
import AppUtils from '@system/applications/utils';

// Component imports
import { HandlebarsApplicationComponent } from '../../mixins/component-handlebars-application-mixin';
import { BaseActorSheet, BaseActorSheetRenderContext } from '../base';
import { SortDirection } from './search-bar';

interface ActionItemState {
    expanded?: boolean;
}

interface AdditionalItemData {
    descriptionHTML?: string;
}

interface RenderContext extends BaseActorSheetRenderContext {
    actionsSearch?: {
        text: string;
        sort: SortDirection;
    };
}

export class ActorActionsListComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/components/actions-list.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'toggle-action-details': this.onToggleActionDetails,
        'use-item': this.onUseItem,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /**
     * Map of id to state
     */
    private itemState: Record<string, ActionItemState> = {};

    /* --- Actions --- */

    public static onToggleActionDetails(
        this: ActorActionsListComponent,
        event: Event,
    ) {
        // Get item element
        const itemElement = $(event.target!).closest('.item[data-item-id]');

        // Get item id
        const itemId = itemElement.data('item-id') as string;

        // Update the state
        this.itemState[itemId].expanded = !this.itemState[itemId].expanded;

        // Set classes
        itemElement.toggleClass('expanded', this.itemState[itemId].expanded);
        $(this.element)
            .find(`.details[data-item-id="${itemId}"]`)
            .toggleClass('expanded', this.itemState[itemId].expanded);
    }

    public static onUseItem(this: ActorActionsListComponent, event: Event) {
        // Get item
        const item = AppUtils.getItemFromEvent(event, this.application.actor);
        if (!item) return;

        // Use the item
        void this.application.actor.useItem(item);
    }

    /* --- Context --- */

    public async _prepareContext(params: unknown, context: RenderContext) {
        // Get action types
        const actionTypes = Object.keys(
            CONFIG.COSMERE.action.types,
        ) as ActionType[];

        // Get all activatable items (actions & items with an associated action)
        const activatableItems = this.application.actor.items
            .filter((item) => item.hasActivation())
            .filter(
                (item) =>
                    !item.isEquippable() ||
                    item.system.equipped ||
                    item.system.alwaysEquipped,
            );

        // Get all items that are not actions (but are activatable, e.g. weapons)
        const nonActionItems = activatableItems.filter(
            (item) => !(item.system instanceof ActionItemDataModel),
        );

        // Get action items
        const actionItems = activatableItems.filter(
            (item) => item.system instanceof ActionItemDataModel,
        ) as CosmereItem<ActionItemData>[];

        // Ensure all items have an expand state record
        activatableItems.forEach((item) => {
            if (!(item.id in this.itemState)) {
                this.itemState[item.id] = {
                    expanded: false,
                };
            }
        });

        const searchText = context.actionsSearch?.text ?? '';
        const sortDir = context.actionsSearch?.sort ?? SortDirection.Descending;

        return {
            ...context,

            sections: [
                ...(await this.categorizeItemsByType(
                    nonActionItems,
                    searchText,
                    sortDir,
                )),
                ...(
                    await Promise.all(
                        actionTypes.map(async (type) => {
                            const items = actionItems
                                .filter((i) => i.system.type === type)
                                .filter((i) =>
                                    i.name.toLowerCase().includes(searchText),
                                )
                                .sort(
                                    (a, b) =>
                                        a.name.compare(b.name) *
                                        (sortDir === SortDirection.Descending
                                            ? 1
                                            : -1),
                                );

                            return {
                                id: type,
                                label: CONFIG.COSMERE.action.types[type]
                                    .labelPlural,
                                items,
                                itemData: await this.prepareItemData(items),
                            };
                        }),
                    )
                ).filter((section) => section.items.length > 0),
            ],

            itemState: this.itemState,
        };
    }

    private async categorizeItemsByType(
        items: CosmereItem[],
        filterText: string,
        sort: SortDirection,
    ) {
        // Get item types
        const types = Object.keys(CONFIG.COSMERE.items.types) as ItemType[];

        // Categorize items by types
        const categories = types.reduce(
            (result, type) => {
                // Get all physical items of type
                result[type] = items
                    .filter((item) => item.type === type)
                    .filter((i) => i.name.toLowerCase().includes(filterText))
                    .sort(
                        (a, b) =>
                            a.name.compare(b.name) *
                            (sort === SortDirection.Descending ? 1 : -1),
                    );

                return result;
            },
            {} as Record<ItemType, CosmereItem[]>,
        );

        // Set up sections
        return await Promise.all(
            (Object.keys(categories) as ItemType[])
                .filter((type) => categories[type].length > 0)
                .map(async (type) => ({
                    id: type,
                    label: CONFIG.COSMERE.items.types[type].labelPlural,
                    items: categories[type],
                    itemData: await this.prepareItemData(categories[type]),
                })),
        );
    }

    private async prepareItemData(items: CosmereItem[]) {
        return await items.reduce(
            async (prev, item) => ({
                ...(await prev),
                [item.id]: {
                    ...(item.hasDescription() && item.system.description?.value
                        ? {
                              descriptionHTML: await TextEditor.enrichHTML(
                                  item.system.description.value,
                              ),
                          }
                        : {}),
                },
            }),
            Promise.resolve({} as Record<string, AdditionalItemData>),
        );
    }

    /* --- Lifecycle --- */

    public _onInitialize(): void {
        if (this.application.isEditable) {
            // Create context menu
            AppContextMenu.create(
                this,
                'right',
                [
                    {
                        name: 'GENERIC.Button.Edit',
                        icon: 'fa-solid fa-pen-to-square',
                        callback: (element) => {
                            const item = AppUtils.getItemFromElement(
                                element,
                                this.application.actor,
                            );
                            if (!item) return;

                            void item.sheet?.render(true);
                        },
                    },
                    {
                        name: 'GENERIC.Button.Remove',
                        icon: 'fa-solid fa-trash',
                        callback: (element) => {
                            const item = AppUtils.getItemFromElement(
                                element,
                                this.application.actor,
                            );
                            if (!item) return;

                            // Remove the item
                            void this.application.actor.deleteEmbeddedDocuments(
                                'Item',
                                [item.id],
                            );
                        },
                    },
                ],
                'a[data-action="toggle-actions-controls"]',
            );
        }
    }
}
