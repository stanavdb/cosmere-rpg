import COSMERE from './system/config';

import './style.scss';
import './system/hooks';

import { preloadHandlebarsTemplates } from './system/util/handlebars';

import * as applications from './system/applications';
import * as dataModels from './system/data';
import * as documents from './system/documents';
import * as dice from './system/dice';

declare global {
    interface LenientGlobalVariableTypes {
        game: never; // the type doesn't matter
    }

    interface CONFIG {
        COSMERE: typeof COSMERE;
    }
}

Hooks.once('init', async () => {
    CONFIG.COSMERE = COSMERE;

    CONFIG.Actor.dataModels = dataModels.actor.config;
    CONFIG.Actor.documentClass = documents.CosmereActor;

    CONFIG.Item.dataModels = dataModels.item.config;
    CONFIG.Item.documentClass = documents.CosmereItem;

    Actors.unregisterSheet('core', ActorSheet);
    // NOTE: Must cast to `any` as registerSheet type doesn't accept ApplicationV2 (even though it's valid to pass it)
    Actors.registerSheet(
        'cosmere-rpg',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        applications.actor.CharacterSheet as any,
        {
            types: ['character'],
            label: `${game.i18n?.localize('COSMERE.Actor.Character.Character')}`,
        },
    );
    Actors.registerSheet(
        'cosmere-rpg',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
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

    // TEMP: This resembles a system module
    (CONFIG.COSMERE.paths.types as Record<string, unknown>).radiant = {
        label: 'Radiant',
    };
});
