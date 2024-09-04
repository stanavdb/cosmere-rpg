import { CosmereItem } from '@system/documents/item';

export class BaseSheet extends ItemSheet {
    get template() {
        return `systems/cosmere-rpg/templates/item/${this.item.type}-sheet.hbs`;
    }

    get item(): CosmereItem {
        return super.item;
    }

    getData() {
        return {
            ...(super.getData() as ItemSheet.ItemSheetData),
            desc: this.item.hasDescription()
                ? this.item.system.description
                : undefined,
            // effects: prepareActiveEffectCategories(this.item.effects)
        };
    }
}
