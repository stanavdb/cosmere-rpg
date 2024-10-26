import { SYSTEM_ID } from './constants';

/**
 * Enumerable of identifiers for setting names.
 * @enum {String}
 */
export const SETTINGS = {
    INTERNAL_FIRST_CREATION: 'firstTimeWorldCreation',
    INTERNAL_LATEST_VERSION: 'latestVersion',
    ITEM_SHEET_SIDE_TABS: 'itemSheetSideTabs',
    ROLL_SKIP_DIALOG_DEFAULT: 'skipRollDialogByDefault',
};

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
}

/**
 * Retrieve a specific setting value for the provided key.
 * @param {string} settingKey The identifier of the setting to retrieve.
 * @returns {string|boolean} The value of the setting as set for the world/client.
 */
export function getSystemSetting(settingKey: string) {
    return game.settings!.get(SYSTEM_ID, settingKey);
}
