import { BaseItemSheet } from '../applications/item/base';
import { SETTING_NAMES, SettingsUtility } from '../settings';

Hooks.on(
    'renderItemSheetV2',
    (itemSheet: BaseItemSheet, node: HTMLFormElement) => {
        if (
            SettingsUtility.getSettingValue(SETTING_NAMES.ITEM_SHEET_SIDE_TABS)
        ) {
            node.classList.add('side-tabs');
        }
    },
);
