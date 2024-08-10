import { Attribute } from '@system/types/cosmere';
import { D20Roll, D20RollOptions } from './d20-roll';
import { RollMode } from './types';

export * from './d20-roll';

interface D20RollConfigration extends D20RollOptions {
    /**
     * The dice roll component parts, excluding the initial d20
     * @default []
     */
    parts?: string[];

    /**
     * Data that will be used when parsing this roll
     * @default {}
     */
    data?: any;

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

export async function d20Roll(config: D20RollConfigration): Promise<D20Roll | null> {
    // Roll parameters
    const formula = ['1d20'].concat(config.parts ?? []).join(' + ');
    const defaultRollMode = config.rollMode ?? game.settings.get('core', 'rollMode');

    // Construct the roll
    const roll = new D20Roll(formula, config.data ?? {}, {
        ...config,
    });

    // Prompt dialog to configure the d20 roll
    const configured = await roll.configureDialog({
        title: config.title,
        plotDie: config.plotDie,
        defaultRollMode,
        defaultAttribute: config.defaultAttribute,
    });
    if (configured === null) return null;

    // Evaluate the configure roll
    await roll.evaluate();

    if (roll && config.chatMessage !== false) {
        await roll.toMessage();
    }

    return roll;
}