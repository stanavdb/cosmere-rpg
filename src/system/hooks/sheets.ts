import { BaseItemSheet } from '../applications/item/base';
import { SYSTEM_ID } from '../constants';

Hooks.on(
    'renderItemSheetV2',
    (itemSheet: BaseItemSheet, node: HTMLFormElement) => {
        if (game.settings!.get(SYSTEM_ID, 'itemSheetSideTabs')) {
            node.classList.add('side-tabs');
        }
    },
);
