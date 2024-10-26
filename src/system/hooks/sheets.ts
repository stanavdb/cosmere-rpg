import { BaseItemSheet } from '../applications/item/base';
import { getSettingValue, SETTING_NAMES } from '../settings';

Hooks.on(
    'renderItemSheetV2',
    (itemSheet: BaseItemSheet, node: HTMLFormElement) => {
        if (getSettingValue(SETTING_NAMES.ITEM_SHEET_SIDE_TABS)) {
            node.classList.add('side-tabs');
        }
    },
);
