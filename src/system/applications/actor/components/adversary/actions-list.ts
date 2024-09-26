import { ItemType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';

// Components
import {
    ActorActionsListComponent,
    ActorActionsListComponentRenderContext,
} from '../actions-list';
import { SortDirection } from '../search-bar';

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

        // Get all traits items
        const traitItems = activatableItems.filter((item) => item.isTrait());

        // Get all weapon items
        const weaponItems = activatableItems.filter((item) => item.isWeapon());

        // Get all action items (all non-trait, non-weapon items)
        const actionItems = activatableItems.filter(
            (item) => !item.isTrait() && !item.isWeapon(),
        );

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
                await this.prepareSection(
                    ItemType.Trait,
                    traitItems,
                    searchText,
                    sortDir,
                ),
                await this.prepareSection(
                    ItemType.Weapon,
                    weaponItems,
                    searchText,
                    sortDir,
                ),
                await this.prepareSection(
                    ItemType.Action,
                    actionItems,
                    searchText,
                    sortDir,
                ),
            ].filter((section) => section.items.length > 0),

            itemState: this.itemState,
        };
    }

    /* --- Helpers --- */

    private async prepareSection(
        type: ItemType,
        items: CosmereItem[],
        searchText: string,
        sortDir: SortDirection,
    ) {
        return {
            id: type,
            label: CONFIG.COSMERE.items.types[type].labelPlural,
            items: items
                .filter((i) => i.name.toLowerCase().includes(searchText))
                .sort(
                    (a, b) =>
                        a.name.compare(b.name) *
                        (sortDir === SortDirection.Descending ? 1 : -1),
                ),
            itemData: await this.prepareItemData(items),
        };
    }
}

// Register
AdversaryActionsListComponent.register('app-adversary-actions-list');
