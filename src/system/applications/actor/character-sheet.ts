import { AttributeConfig, ResourceConfig, SkillConfig } from '@src/system/types/config';
import { Attribute, Resource, Skill } from '@src/system/types/cosmere';
import { BaseSheet } from './base-sheet';
import { CosmereActor } from '@system/documents/actor';
import { CharacterActorData } from '@system/data/actor/character';

export class CharacterSheet extends BaseSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: [ 'cosmere-rpg', 'sheet', 'actor', 'character' ],
            width: 950,
            height: 1000,
            resizeable: true
        });
    }

    get actor() {
        return super.actor as CosmereActor<CharacterActorData>;
    }

    getData(options?: Partial<ActorSheet.Options>) {
        return {
            ...super.getData(options),

            ancestryLabel: 'Human', // TEMP
            pathsLabel: 'Warrior', //TEMP

            recovery: {
                die: this.actor.system.recovery.die
            },
        }
    }
}