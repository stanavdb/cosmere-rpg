import {
    ItemType,
    ActionType,
    ActivationType,
    ActionCostType,
} from '@system/types/cosmere';
import { CosmereItem, CosmereActor } from '@system/documents';

// Components
import {
    ActorActionsListComponent,
    ActorActionsListComponentRenderContext,
    ListSection,
} from '../actions-list';
import { SortDirection } from '../search-bar';

// Constants

export class AdversaryActionsListComponent extends ActorActionsListComponent {
    /* --- Context --- */

    public async _prepareContext(
        params: unknown,
        context: ActorActionsListComponentRenderContext,
    ) {
        // Get all activatable items (actions & items with an associated action)
        const activatableItems = this.application.actor.items
            .filter((item) => item.hasActivation())
            .filter(
                (item) =>
                    !item.isEquippable() ||
                    item.system.equipped ||
                    item.system.alwaysEquipped,
            );

        // Ensure all items have an expand state record
        activatableItems.forEach((item) => {
            if (!(item.id in this.itemState)) {
                this.itemState[item.id] = {
                    expanded: false,
                };
            }
        });

        // Prepare sections
        this.sections = [
            this.prepareSection(ItemType.Trait),
            this.prepareSection(ItemType.Weapon),
            this.prepareSection(ItemType.Action),
        ];

        const searchText = context.actionsSearch?.text ?? '';
        const sortDir = context.actionsSearch?.sort ?? SortDirection.Descending;

        return {
            ...context,

            sections: [
                await this.prepareSectionData(
                    this.sections[0],
                    activatableItems,
                    searchText,
                    sortDir,
                ),
                await this.prepareSectionData(
                    this.sections[1],
                    activatableItems,
                    searchText,
                    sortDir,
                ),
                await this.prepareSectionData(
                    this.sections[2],
                    activatableItems,
                    searchText,
                    sortDir,
                ),
            ].filter(
                (section) =>
                    section.items.length > 0 ||
                    (this.application.mode === 'edit' && section.default),
            ),

            itemState: this.itemState,
        };
    }

    /* --- Helpers --- */

    private prepareSection(type: ItemType): ListSection {
        return {
            id: type,
            label: CONFIG.COSMERE.items.types[type].labelPlural,
            default: true,
            filter: (item: CosmereItem) => item.type === type,
            new: (parent: CosmereActor) =>
                CosmereItem.create(
                    {
                        type,
                        name: game.i18n!.localize(
                            `COSMERE.Item.Type.${type.capitalize()}.New`,
                        ),
                        system: {
                            activation: {
                                type: ActivationType.Utility,
                                cost: {
                                    type: ActionCostType.Action,
                                    value: 1,
                                },
                            },

                            ...(type === ItemType.Weapon
                                ? {
                                      equipped: true,
                                  }
                                : {}),
                        },
                    },
                    { parent },
                ) as Promise<CosmereItem>,
        };
    }

    private async prepareSectionData(
        section: ListSection,
        items: CosmereItem[],
        searchText: string,
        sort: SortDirection,
    ) {
        // Get items for section, filter by search text, and sort
        const sectionItems = items
            .filter(section.filter)
            .filter((i) => i.name.toLowerCase().includes(searchText))
            .sort(
                (a, b) =>
                    a.name.compare(b.name) *
                    (sort === SortDirection.Descending ? 1 : -1),
            );

        return {
            ...section,
            canAddNewItems: !!section.new,
            items: sectionItems,
            itemData: await this.prepareItemData(sectionItems),
        };
    }
}

// Register
AdversaryActionsListComponent.register('app-adversary-actions-list');
