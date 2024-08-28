import { CosmereItem } from '@src/system/documents';
import { BaseSheet } from './base-sheet';
import { AncestryItemDataModel } from '@src/system/data/item';

export class AncestrySheet extends BaseSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['cosmere-rpg', 'sheet', 'item', 'ancestry'],
            width: 520,
            height: 250,
            resizeable: true,
        });
    }

    get item() {
        return super.item as CosmereItem<AncestryItemDataModel>;
    }

    getData() {
        return {
            ...super.getData(),
        };
    }
}
