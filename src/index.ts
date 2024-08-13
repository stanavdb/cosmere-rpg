import COSMERE from './system/config';

import './style.scss';

import './system/util/handlebars';

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

Hooks.once('init', () => {
    CONFIG.COSMERE = COSMERE;

    CONFIG.Actor.dataModels = dataModels.actor.config;
    CONFIG.Actor.documentClass = documents.CosmereActor;

    CONFIG.Item.dataModels = dataModels.item.config;
    CONFIG.Item.documentClass = documents.CosmereItem;

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('cosmere-rpg', applications.actor.CharacterSheet, {
        types: ['character'],
        label: 'Character',
    });
    Actors.registerSheet('cosmere-rpg', applications.actor.AdversarySheet, {
        types: ['adversary'],
        label: 'Adversary',
    });

    CONFIG.Dice.types.push(dice.PlotDie);
    CONFIG.Dice.terms.p = dice.PlotDie;
    CONFIG.Dice.termTypes[dice.PlotDie.name] = dice.PlotDie;

    // NOTE: foundry-vtt-types has two version of the RollTerm class which do not match
    // causing this to error. Bug?
    // @league-of-foundry-developers/foundry-vtt-types/src/foundry/client/dice/term.d.mts
    // @league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/dice/terms/term.d.mts
    // @ts-expect-error see note
    CONFIG.Dice.rolls.push(dice.D20Roll);
});
