import { Attribute, DamageType } from '@system/types/cosmere';
import { D20Roll, D20RollOptions, D20RollData } from './d20-roll';
import { DamageRoll, DamageRollOptions, DamageRollData } from './damage-roll';
import { RollMode } from './types';

export * from './d20-roll';
export * from './damage-roll';
export * from './plot-die';

export interface D20RollConfigration extends D20RollOptions {
    /**
     * The dice roll component parts, excluding the initial d20
     * @default []
     */
    parts?: string[];

    /**
     * Data that will be used when parsing this roll
     * @default {}
     */
    data: D20RollData;

    /* -- Chat message -- */

    /**
     * Should a chat message be created for this roll?
     * @default true
     */
    chatMessage?: boolean;

    /* -- Roll configuration dialog -- */

    /**
     * HTML template used to display the roll configuration dialog
     */
    template?: string;

    /**
     * Title of the roll configuration dialog
     */
    title: string;

    /**
     * The attribute that is used for the roll by default
     */
    defaultAttribute?: Attribute;

    /**
     * The roll mode that should be selected by default
     */
    defaultRollMode?: RollMode;
}

export interface DamageRollConfiguration extends DamageRollOptions {
    /**
     * The damage formula to use for this roll
     */
    formula: string;

    /**
     * Data that will be used when parsing this roll
     */
    data: DamageRollData;
}

export async function d20Roll(
    config: D20RollConfigration,
): Promise<D20Roll | null> {
    // Roll parameters
    const formula = ['1d20'].concat(config.parts ?? []).join(' + ');
    const defaultRollMode =
        config.rollMode ?? game.settings!.get('core', 'rollMode');

    // Construct the roll
    const roll = new D20Roll(formula, config.data, {
        ...config,
    });

    // Prompt dialog to configure the d20 roll
    const configured = await roll.configureDialog({
        title: config.title,
        plotDie: config.plotDie,
        defaultRollMode,
        defaultAttribute:
            config.defaultAttribute ?? config.data.skill.attribute,
    });
    if (configured === null) return null;

    // Evaluate the configure roll
    await roll.evaluate();

    if (roll && config.chatMessage !== false) {
        await roll.toMessage();
    }

    return roll;
}

export async function damageRoll(
    config: DamageRollConfiguration,
): Promise<Roll> {
    // Construct roll
    const roll = new DamageRoll(config.formula, config.data, {
        damageType: config.damageType,
        mod: config.mod,
        advantageMode: config.advantageMode,
        allowStrings: config.allowStrings,
        maximize: config.maximize,
        minimize: config.minimize,
    });

    // Evaluate the roll
    await roll.evaluate();

    // Return result
    return roll;
}
