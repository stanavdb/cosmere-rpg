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
    CONFIG.Actor.documentClass = documents.CosmereActor as any;

    CONFIG.Item.dataModels = dataModels.item.config;

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('cosmere-rpg', applications.actor.CharacterSheet, {
        types: [ 'character' ],
        label: 'Character'
    });
    Actors.registerSheet('cosmere-rpg', applications.actor.AdversarySheet, {
        types: [ 'adversary' ],
        label: 'Adversary'
    });

    CONFIG.Dice.types.push(dice.PlotDie);
    CONFIG.Dice.terms['p'] = dice.PlotDie;
    CONFIG.Dice.termTypes[dice.PlotDie.name] = dice.PlotDie;
    CONFIG.Dice.rolls.push(dice.D20Roll);
});