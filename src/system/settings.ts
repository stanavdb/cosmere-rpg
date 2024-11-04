import { SYSTEM_ID } from './constants';

/**
 * Index of identifiers for system settings.
 */
export const SETTINGS = {
    INTERNAL_FIRST_CREATION: 'firstTimeWorldCreation',
    INTERNAL_LATEST_VERSION: 'latestVersion',
    ITEM_SHEET_SIDE_TABS: 'itemSheetSideTabs',
    ROLL_SKIP_DIALOG_DEFAULT: 'skipRollDialogByDefault',
    CHAT_ENABLE_OVERLAY_BUTTONS: 'enableOverlayButtons',
    CHAT_ENABLE_APPLY_BUTTONS: 'enableApplyButtons',
    CHAT_ALWAYS_SHOW_BUTTONS: 'alwaysShowChatButtons',
    APPLY_DAMAGE_TO: 'applyDamageTo',
} as const;

/**
 * Register all of the system's settings.
 */
export function registerSystemSettings() {
    game.settings!.register(SYSTEM_ID, SETTINGS.INTERNAL_FIRST_CREATION, {
        name: 'First Time World Creation',
        scope: 'world',
        config: false,
        default: true,
        type: Boolean,
    });

    game.settings!.register(SYSTEM_ID, SETTINGS.INTERNAL_LATEST_VERSION, {
        name: 'Latest Version',
        scope: 'world',
        config: false,
        default: '0.0.0',
        type: String,
    });

    // SHEET SETTINGS
    const sheetOptions = [
        { name: SETTINGS.ITEM_SHEET_SIDE_TABS, default: false },
    ];

    sheetOptions.forEach((option) => {
        game.settings!.register(SYSTEM_ID, option.name, {
            name: game.i18n!.localize(`SETTINGS.${option.name}.name`),
            hint: game.i18n!.localize(`SETTINGS.${option.name}.hint`),
            scope: 'world',
            config: true,
            type: Boolean,
            default: option.default,
        });
    });

    // ROLL SETTINGS
    const rollOptions = [
        { name: SETTINGS.ROLL_SKIP_DIALOG_DEFAULT, default: false },
    ];

    rollOptions.forEach((option) => {
        game.settings!.register(SYSTEM_ID, option.name, {
            name: game.i18n!.localize(`SETTINGS.${option.name}.name`),
            hint: game.i18n!.localize(`SETTINGS.${option.name}.hint`),
            scope: 'client',
            config: true,
            type: Boolean,
            default: option.default,
        });
    });

    // CHAT SETTINGS
    const chatOptions = [
        { name: SETTINGS.CHAT_ENABLE_OVERLAY_BUTTONS, default: true },
        { name: SETTINGS.CHAT_ENABLE_APPLY_BUTTONS, default: true },
        { name: SETTINGS.CHAT_ALWAYS_SHOW_BUTTONS, default: true },
    ];

    chatOptions.forEach((option) => {
        game.settings!.register(SYSTEM_ID, option.name, {
            name: game.i18n!.localize(`SETTINGS.${option.name}.name`),
            hint: game.i18n!.localize(`SETTINGS.${option.name}.hint`),
            scope: 'client',
            config: true,
            type: Boolean,
            default: option.default,
            requiresReload: true,
        });
    });

    game.settings!.register(SYSTEM_ID, SETTINGS.APPLY_DAMAGE_TO, {
        name: game.i18n!.localize(`SETTINGS.${SETTINGS.APPLY_DAMAGE_TO}.name`),
        hint: game.i18n!.localize(`SETTINGS.${SETTINGS.APPLY_DAMAGE_TO}.hint`),
        scope: 'client',
        config: true,
        type: Number,
        default: 0 as number,
        requiresReload: true,
        choices: {
            0: game.i18n!.localize(
                `SETTINGS.${SETTINGS.APPLY_DAMAGE_TO}.choices.0`,
            ),
            1: game.i18n!.localize(
                `SETTINGS.${SETTINGS.APPLY_DAMAGE_TO}.choices.1`,
            ),
            2: game.i18n!.localize(
                `SETTINGS.${SETTINGS.APPLY_DAMAGE_TO}.choices.2`,
            ),
            3: game.i18n!.localize(
                `SETTINGS.${SETTINGS.APPLY_DAMAGE_TO}.choices.3`,
            ),
            4: game.i18n!.localize(
                `SETTINGS.${SETTINGS.APPLY_DAMAGE_TO}.choices.4`,
            ),
        },
    });
}

/**
 * Index of identifiers for system keybindings.
 */
export const KEYBINDINGS = {
    SKIP_DIALOG_DEFAULT: 'skipDialogDefault',
    SKIP_DIALOG_ADVANTAGE: 'skipDialogAdvantage',
    SKIP_DIALOG_DISADVANTAGE: 'skipDialogDisadvantage',
    SKIP_DIALOG_RAISE_STAKES: 'skipDialogRaiseStakes',
} as const;

/**
 * Register all of the system's keybindings.
 */
export function registerSystemKeybindings() {
    const keybindings = [
        {
            name: KEYBINDINGS.SKIP_DIALOG_DEFAULT,
            editable: [{ key: 'AltLeft' }, { key: 'AltRight' }],
        },
        {
            name: KEYBINDINGS.SKIP_DIALOG_ADVANTAGE,
            editable: [{ key: 'ShiftLeft' }, { key: 'ShiftRight' }],
        },
        {
            name: KEYBINDINGS.SKIP_DIALOG_DISADVANTAGE,
            editable: [
                { key: 'ControlLeft' },
                { key: 'ControlRight' },
                { key: 'OsLeft' },
                { key: 'OsRight' },
            ],
        },
        {
            name: KEYBINDINGS.SKIP_DIALOG_RAISE_STAKES,
            editable: [{ key: 'KeyQ' }],
        },
    ];

    keybindings.forEach((keybind) => {
        game.keybindings!.register(SYSTEM_ID, keybind.name, {
            name: `KEYBINDINGS.${keybind.name}`,
            editable: keybind.editable,
        });
    });
}

/**
 * Retrieve a specific setting value for the provided key.
 * @param {string} settingKey The identifier of the setting to retrieve.
 * @returns {string|boolean} The value of the setting as set for the world/client.
 */
export function getSystemSetting(settingKey: string) {
    return game.settings!.get(SYSTEM_ID, settingKey);
}

/**
 * Retrieves an array of keybinding values for the provided key.
 * @param {string} keybindingKey The identifier of the keybinding to retrieve.
 * @returns {Array<object>} The value of the keybindings associated with the given key.
 */
export function getSystemKeybinding(keybindingKey: string) {
    return game.keybindings!.get(SYSTEM_ID, keybindingKey);
}
