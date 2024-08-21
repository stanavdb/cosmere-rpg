import {
    AttributeGroup,
    Skill,
    ItemType,
    ActionType,
} from '@system/types/cosmere';
import { CosmereActor } from '@system/documents/actor';
import { CosmereItem } from '@system/documents/item';

import { ActionItemDataModel, ActionItemData } from '@system/data/item';

type TabId = 'actions' | 'inventory';

export class BaseSheet extends ActorSheet {
    private currentTab: TabId = 'actions';

    get template() {
        return `systems/cosmere-rpg/templates/actors/${this.actor.type}-sheet.hbs`;
    }

    get actor(): CosmereActor {
        return super.actor;
    }

    getData(options?: Partial<ActorSheet.Options>) {
        return {
            ...(super.getData(options) as ActorSheet.ActorSheetData),

            attributeGroups: (
                Object.keys(CONFIG.COSMERE.attributeGroups) as AttributeGroup[]
            ).map(this.getDataForAttributeGroup.bind(this)),

            items: this.getItemData(),

            tab: this.currentTab,
        };
    }

    /* --- Event Listeners and handlers --- */

    public activateListeners(html: JQuery): void {
        // Owner only listeners
        if (this.actor.isOwner) {
            // Skill test
            html.find('.skill .rollable').on(
                'click',
                this.onRollSkillTest.bind(this),
            );

            // Item listeners
            html.find('.item [data-action]').on(
                'click',
                this.onItemAction.bind(this),
            );
        }

        html.find('nav a.tab-item[data-tab]').on(
            'click',
            this.onSelectTab.bind(this),
        );
    }

    /* --- Internal functions --- */

    private onSelectTab(event: Event) {
        event.preventDefault();

        // Get the tab id
        const tabId = $(event.currentTarget!).data('tab') as TabId;

        // Ensure tab was changed
        if (tabId === this.currentTab) return;

        // Change which tab is active
        this.currentTab = tabId;

        // Re-render
        this.render(true);
    }

    private onRollSkillTest(event: Event) {
        event.preventDefault();

        const skillId = $(event.currentTarget!)
            .closest('[data-id]')
            .data('id') as Skill;
        void this.actor.rollSkill(skillId);
    }

    private onItemAction(event: Event) {
        event.preventDefault();
        event.stopPropagation();

        // Get the action
        const action = $(event.currentTarget!)
            .closest('[data-action]')
            .data('action') as string;

        console.log('action', action);

        // Get the item id
        const itemId = $(event.currentTarget!)
            .closest('[data-item-id]')
            .data('item-id') as string;

        // Find the item
        const item = this.actor.items.get(itemId);
        if (!item) return;

        switch (action) {
            case 'use':
                void this.actor.useItem(item);
                break;
            case 'view':
            case 'edit':
                item.sheet?.render(true);
                break;
            case 'delete':
                void this.actor.deleteEmbeddedDocuments('Item', [item.id]);
        }
    }

    /* ---------------------- */

    private getDataForAttributeGroup(groupId: AttributeGroup) {
        // Get the attribute group config
        const groupConfig = CONFIG.COSMERE.attributeGroups[groupId];

        return {
            id: groupId,
            config: groupConfig,
            defense: this.actor.system.defenses[groupId],
            attributes: this.getAttributesDataForAttributeGroup(groupId),
            skills: this.getSkillsDataForAttributeGroup(groupId),
            resource: this.getResourceDataForAttributeGroup(groupId),
        };
    }

    private getAttributesDataForAttributeGroup(groupId: AttributeGroup) {
        // Get the attribute group config
        const groupConfig = CONFIG.COSMERE.attributeGroups[groupId];

        return groupConfig.attributes.map((attrId) => {
            // Get the attribute config
            const attrConfig = CONFIG.COSMERE.attributes[attrId];

            return {
                id: attrId,
                config: attrConfig,
                ...this.actor.system.attributes[attrId],
            };
        });
    }

    private getSkillsDataForAttributeGroup(groupId: AttributeGroup) {
        // Get the attribute group config
        const groupConfig = CONFIG.COSMERE.attributeGroups[groupId];

        // Get the skill ids
        const skillIds = groupConfig.attributes
            .map((attrId) => CONFIG.COSMERE.attributes[attrId])
            .map((attr) => attr.skills)
            .flat()
            .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

        // Return skill data
        return skillIds
            .map((skillId) => ({
                id: skillId,
                config: CONFIG.COSMERE.skills[skillId],
                ...this.actor.system.skills[skillId],
                active:
                    !CONFIG.COSMERE.skills[skillId].hiddenUntilAcquired ||
                    this.actor.system.skills[skillId].rank >= 1,
            }))
            .sort((a, b) => {
                const _a = a.config.hiddenUntilAcquired ? 1 : 0;
                const _b = b.config.hiddenUntilAcquired ? 1 : 0;
                return _a - _b;
            });
    }

    private getResourceDataForAttributeGroup(groupId: AttributeGroup) {
        // Get the attribute group config
        const groupConfig = CONFIG.COSMERE.attributeGroups[groupId];

        return {
            id: groupConfig.resource,
            config: CONFIG.COSMERE.resources[groupConfig.resource],
            ...this.actor.system.resources[groupConfig.resource],
        };
    }

    private getItemData() {
        return {
            actions: this.getActionsData(),
            inventory: this.getInventoryData(),
        };
    }

    private getActionsData() {
        // Get all activatable items
        const activatableItems = this.actor.items
            .filter((item) => item.hasActivation())
            .filter((item) => !item.isEquippable() || item.system.equipped);

        // Get all items that are not actions (but are activatable, e.g. weapons)
        const nonActionItems = activatableItems.filter(
            (item) => !(item.system instanceof ActionItemDataModel),
        );

        // Get action items
        const actionItems = activatableItems.filter(
            (item) => item.system instanceof ActionItemDataModel,
        ) as CosmereItem<ActionItemData>[];

        // Get action types
        const actionTypes = Object.keys(
            CONFIG.COSMERE.action.types,
        ) as ActionType[];

        return [
            ...this.categorizeItemsByType(nonActionItems),
            ...actionTypes
                .map((type) => ({
                    id: type,
                    label: CONFIG.COSMERE.action.types[type].labelPlural,
                    items: actionItems.filter(
                        (i) => (i.system.type as ActionType) === type,
                    ),
                }))
                .filter((section) => section.items.length > 0),
        ];
    }

    private getInventoryData() {
        // Assume all physical items are part of inventory
        const physicalItems = this.actor.items.filter((item) =>
            item.isPhysical(),
        );

        return this.categorizeItemsByType(physicalItems);
    }

    private categorizeItemsByType(items: CosmereItem[]) {
        // Get item types
        const types = Object.keys(CONFIG.COSMERE.items.types) as ItemType[];

        // Categorize items by types
        const categories = types.reduce(
            (result, type) => {
                // Get all physical items of type
                result[type] = items.filter((item) => item.type === type);

                return result;
            },
            {} as Record<ItemType, CosmereItem[]>,
        );

        // Set up sections
        return (Object.keys(categories) as ItemType[])
            .filter((type) => categories[type].length > 0)
            .map((type) => ({
                id: type,
                label: CONFIG.COSMERE.items.types[type].labelPlural,
                items: categories[type],
            }));
    }
}
