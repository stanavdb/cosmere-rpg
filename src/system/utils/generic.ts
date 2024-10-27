import {
    getSystemKeybinding,
    getSystemSetting,
    KEYBINDINGS,
    SETTINGS,
} from '../settings';
import { AdvantageMode } from '../types/roll';

/**
 * Determine if the keys of a requested keybinding are pressed.
 * @param {string} action Keybinding action within the system namespace. Can have multiple keybindings associated.
 * @returns {boolean} True if one of the keybindings for the requested action are triggered, false otherwise.
 */
export function areKeysPressed(action: string): boolean {
    const keybinds = getSystemKeybinding(action);

    if (!keybinds || keybinds.length === 0) {
        return false;
    }

    const activeModifiers = {} as Record<string, boolean>;

    const addModifiers = (key: string) => {
        if (hasKey(KeyboardManager.MODIFIER_CODES, key)) {
            KeyboardManager.MODIFIER_CODES[key].forEach(
                (n: string) =>
                    (activeModifiers[n] = game.keyboard!.downKeys.has(n)),
            );
        }
    };
    addModifiers(KeyboardManager.MODIFIER_KEYS.CONTROL);
    addModifiers(KeyboardManager.MODIFIER_KEYS.SHIFT);
    addModifiers(KeyboardManager.MODIFIER_KEYS.ALT);

    console.log(keybinds, game.keyboard!.downKeys, activeModifiers);

    return getSystemKeybinding(action).some((b) => {
        if (
            game.keyboard!.downKeys.has(b.key) &&
            b.modifiers?.every((m) => activeModifiers[m])
        )
            return true;
        if (b.modifiers?.length) return false;
        return activeModifiers[b.key];
    });
}

/**
 * Checks if a given object has the given property key as a key for indexing.
 * Adding this check beforehand allows an object to be indexed by that key directly without typescript errors.
 * @param {T} obj The object to check for indexing.
 * @param {PropertyKey} key The key to check within the object.
 * @returns {boolean} True if the given object has requested property key, false otherwise.
 */
export function hasKey<T extends object>(
    obj: T,
    key: PropertyKey,
): key is keyof T {
    return key in obj;
}

/**
 * Processes pressed keys and provided config values to determine final values for a roll, specifically:
 * if it should skip the configuration dialog, what advantage mode it is using, and if it has raised stakes.
 * @param {object} [options]
 * @param {boolean} [options.configure] Should the roll dialog be skipped?
 * @param {boolean} [options.advantage] Is something granting this roll advantage?
 * @param {boolean} [options.disadvantage] Is something granting this roll disadvantage?
 * @param {boolean} [options.raiseStakes] Is something granting this roll raised stakes?
 * @returns {{fastForward: boolean, advantageMode: AdvantageMode, plotDie: boolean}} Whether a roll should fast forward, have a plot die, and its advantage mode.
 */
export function determineConfigurationMode({
    configure = true,
    advantage = false,
    disadvantage = false,
    raiseStakes = false,
}) {
    const modifiers = {
        advantage: areKeysPressed(KEYBINDINGS.SKIP_DIALOG_ADVANTAGE),
        disadvantage: areKeysPressed(KEYBINDINGS.SKIP_DIALOG_DISADVANTAGE),
        raiseStakes: areKeysPressed(KEYBINDINGS.SKIP_DIALOG_RAISE_STAKES),
    };

    const fastForward =
        !configure ||
        isFastForward() ||
        Object.values(modifiers).some((k) => k);
    const advantageMode =
        advantage || modifiers.advantage
            ? AdvantageMode.Advantage
            : disadvantage || modifiers.disadvantage
              ? AdvantageMode.Disadvantage
              : AdvantageMode.None;
    const plotDie = raiseStakes || modifiers.raiseStakes;

    return { fastForward, advantageMode, plotDie };
}

/**
 * Processes pressed keys and selected system settings to determine if a roll should fast forward.
 * This function allows the swappable behaviour of the Skip/Show Dialog modifier key, making it behave correctly depending on the system setting selected by the user.
 * @returns {boolean} Whether a roll should fast forward or not.
 */
export function isFastForward() {
    const skipKeyPressed = areKeysPressed(KEYBINDINGS.SKIP_DIALOG_DEFAULT);
    const skipByDefault = getSystemSetting(SETTINGS.ROLL_SKIP_DIALOG_DEFAULT);

    return (
        (skipByDefault && !skipKeyPressed) || (!skipByDefault && skipKeyPressed)
    );
}
