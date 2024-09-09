import COSMERE from './system/config';

import './style.scss';
import './system/hooks';

import { preloadHandlebarsTemplates } from './system/util/handlebars';

import * as applications from './system/applications';
import * as dataModels from './system/data';
import * as documents from './system/documents';
import * as dice from './system/dice';
import { Condition } from './system/types/cosmere';
import CosmereAPI from './system/api';

declare global {
    interface LenientGlobalVariableTypes {
        game: never; // the type doesn't matter
    }

    interface CONFIG {
        COSMERE: typeof COSMERE;
    }

    // NOTE: Must use var to affect globalThis
    // eslint-disable-next-line no-var
    var cosmereRPG: {
        api: typeof CosmereAPI;
    };
}

Hooks.once('init', async () => {
    globalThis.cosmereRPG = Object.assign(game.system!, { api: CosmereAPI });

    CONFIG.COSMERE = COSMERE;

    CONFIG.Actor.dataModels = dataModels.actor.config;
    CONFIG.Actor.documentClass = documents.CosmereActor;

    CONFIG.Item.dataModels = dataModels.item.config;
    CONFIG.Item.documentClass = documents.CosmereItem;

    CONFIG.Combat.documentClass = documents.CosmereCombat;
    CONFIG.Combatant.documentClass = documents.CosmereCombatant;
    CONFIG.ui.combat = applications.combat.CosmereCombatTracker;

    CONFIG.ActiveEffect.legacyTransferral = false;

    Actors.unregisterSheet('core', ActorSheet);
    // NOTE: Must cast to `any` as registerSheet type doesn't accept ApplicationV2 (even though it's valid to pass it)
    Actors.registerSheet(
        'cosmere-rpg',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        applications.actor.CharacterSheet as any,
        {
            types: ['character'],
            label: `${game.i18n?.localize('COSMERE.Actor.Character.Character')}`,
        },
    );
    Actors.registerSheet(
        'cosmere-rpg',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        applications.actor.AdversarySheet as any,
        {
            types: ['adversary'],
            label: `${game.i18n?.localize('COSMERE.Actor.Adversary.Adversary')}`,
        },
    );

    CONFIG.Dice.types.push(dice.PlotDie);
    CONFIG.Dice.terms.p = dice.PlotDie;
    CONFIG.Dice.termTypes[dice.PlotDie.name] = dice.PlotDie;

    // NOTE: foundry-vtt-types has two version of the RollTerm class which do not match
    // causing this to error. Bug?
    // @league-of-foundry-developers/foundry-vtt-types/src/foundry/client/dice/term.d.mts
    // @league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/dice/terms/term.d.mts
    // @ts-expect-error see note
    CONFIG.Dice.rolls.push(dice.D20Roll);

    // Load templates
    await preloadHandlebarsTemplates();

    // Register status effects
    registerStatusEffects();

    /* ------------------- */

    // TEMP: This resembles a system module
    (CONFIG.COSMERE.paths.types as Record<string, unknown>).radiant = {
        label: 'Radiant',
    };
});

/**
 * Helper function to register the configured
 * conditions as status effects.
 */
function registerStatusEffects() {
    // Map conditions to status effects
    const statusEffects = (
        Object.keys(CONFIG.COSMERE.conditions) as Condition[]
    ).map((condition) => {
        // Get the config
        const config = CONFIG.COSMERE.conditions[condition];

        return {
            id: condition,
            name: config.label,
            img: config.icon,
            _id: `cond${condition}`.padEnd(16, '0'),
        };
    });

    // Register status effects
    CONFIG.statusEffects = statusEffects;
}
