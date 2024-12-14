import { BaseItemSheet } from '../applications/item/base';
import { BaseActorSheet } from '../applications/actor/base';
import { getSystemSetting, SETTINGS } from '../settings';

Hooks.on(
    'renderItemSheetV2',
    (itemSheet: BaseItemSheet, node: HTMLFormElement) => {
        if (getSystemSetting(SETTINGS.ITEM_SHEET_SIDE_TABS)) {
            node.classList.add('side-tabs');
        }
    },
);

Hooks.on(
    'renderActorSheetV2',
    (actorSheet: BaseActorSheet, node: HTMLFormElement) => {
        if (!getSystemSetting(SETTINGS.ACTOR_SHEET_INLINE_TABS)) {
            node.classList.add('side-tabs');
        }
    },
);
