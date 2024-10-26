import { BaseItemSheet } from '../applications/item/base';
import { getSystemSetting, SETTINGS } from '../settings';

Hooks.on(
    'renderItemSheetV2',
    (itemSheet: BaseItemSheet, node: HTMLFormElement) => {
        if (getSystemSetting(SETTINGS.ITEM_SHEET_SIDE_TABS)) {
            node.classList.add('side-tabs');
        }
    },
);
