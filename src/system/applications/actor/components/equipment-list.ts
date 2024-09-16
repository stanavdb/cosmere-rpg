import { EquipHand, ItemType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents/item';
import { ConstructorOf } from '@system/types/utils';

import { AppContextMenu } from '@system/applications/utils/context-menu';

// Utils
import AppUtils from '@system/applications/utils';

// Component imports
import { HandlebarsApplicationComponent } from '../../mixins/component-handlebars-application-mixin';
import { BaseActorSheet, BaseActorSheetRenderContext } from '../base';
import { SortDirection } from './search-bar';

interface EquipmentItemState {
    expanded?: boolean;
}

interface AdditionalItemData {
    descriptionHTML?: string;
}

interface RenderContext extends BaseActorSheetRenderContext {
    equipmentSearch: {
        text: string;
        sort: SortDirection;
    };
}

export class CharacterEquipmentListComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/equipment-list.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'toggle-action-details': this.onToggleActionDetails,
        'use-item': this.onUseItem,
        'toggle-equip': this.onToggleEquip,
        'cycle-equip': this.onCycleEquip,
        'decrease-quantity': this.onDecreaseQuantity,
        'increase-quantity': this.onIncreaseQuantity,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /**
     * Map of id to state
     */
    private itemState: Record<string, EquipmentItemState> = {};

    /* --- Actions --- */

    public static onToggleActionDetails(
        this: CharacterEquipmentListComponent,
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

    public static onUseItem(
        this: CharacterEquipmentListComponent,
        event: Event,
    ) {
        // Get item
        const item = AppUtils.getItemFromEvent(event, this.application.actor);
        if (!item) return;

        // Use the item
        void this.application.actor.useItem(item);
    }

    public static onToggleEquip(
        this: CharacterEquipmentListComponent,
        event: Event,
    ) {
        if (!this.application.isEditable) return;

        // Get item
        const item = AppUtils.getItemFromEvent(event, this.application.actor);
        if (!item) return;
        if (!item.isEquippable()) return;

        void item.update({
            'system.equipped': !item.system.equipped,
        });
    }

    public static onCycleEquip(
        this: CharacterEquipmentListComponent,
        event: Event,
    ) {
        if (!this.application.isEditable) return;

        // Get item
        const item = AppUtils.getItemFromEvent(event, this.application.actor);
        if (!item) return;
        if (!item.isEquippable()) return;

        // Get hand types
        const handTypes = Object.keys(
            CONFIG.COSMERE.items.equip.hand,
        ) as EquipHand[];

        // Get current index
        const index = handTypes.indexOf(
            item.system.equip.hand ?? handTypes[handTypes.length - 1], // Default to last hand type, so we'll cycle to the first
        );

        const shouldEquip = !item.system.equipped;
        const shouldUnequip =
            item.system.equipped && index === handTypes.length - 1;

        const newEquip = shouldEquip || !shouldUnequip;
        const newIndex = shouldEquip ? 0 : shouldUnequip ? index : index + 1;

        // Update item
        void item.update({
            'system.equipped': newEquip,
            'system.equip.hand': handTypes[newIndex],
        });
    }

    public static async onDecreaseQuantity(
        this: CharacterEquipmentListComponent,
        event: Event,
    ) {
        // Get item
        const item = AppUtils.getItemFromEvent(event, this.application.actor);
        if (!item) return;
        if (!item.isPhysical()) return;

        await item.update(
            {
                'system.quantity': Math.max(0, item.system.quantity - 1),
            },
            { render: false },
        );
        await this.render();
    }

    public static async onIncreaseQuantity(
        this: CharacterEquipmentListComponent,
        event: Event,
    ) {
        // Get item
        const item = AppUtils.getItemFromEvent(event, this.application.actor);
        if (!item) return;
        if (!item.isPhysical()) return;

        await item.update(
            {
                'system.quantity': item.system.quantity + 1,
            },
            { render: false },
        );
        await this.render();
    }

    /* --- Context --- */

    public async _prepareContext(params: unknown, context: RenderContext) {
        // Assume all physical items are part of inventory
        const physicalItems = this.application.actor.items.filter((item) =>
            item.isPhysical(),
        );

        // Ensure all items have an expand state record
        physicalItems.forEach((item) => {
            if (!(item.id in this.itemState)) {
                this.itemState[item.id] = {
                    expanded: false,
                };
            }
        });

        return {
            ...context,

            sections: await this.categorizeItemsByType(
                physicalItems,
                context.equipmentSearch.text,
                context.equipmentSearch.sort,
            ),

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
