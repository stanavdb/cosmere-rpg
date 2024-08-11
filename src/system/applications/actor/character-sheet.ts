import { ItemType } from '@src/system/types/cosmere';
import { BaseSheet } from './base-sheet';
import { CosmereActor } from '@system/documents/actor';
import { CharacterActorData } from '@system/data/actor/character';

const DEFAULT_ANCESTRY_LABEL = '[Ancestry]';
const DEFAULT_PATH_LABEL = '[Path]';

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
        // Find the ancestry
        const ancestryItem = this.actor.items.find(item => item.type === ItemType.Ancestry);

        // Find the path
        const pathItem = this.actor.items.find(item => item.type === ItemType.Path);

        return {
            ...super.getData(options),

            ancestryLabel: ancestryItem?.name ?? DEFAULT_ANCESTRY_LABEL,
            pathsLabel: pathItem?.name ?? DEFAULT_PATH_LABEL,

            recovery: {
                die: this.actor.system.recovery.die
            },
        }
    }
}