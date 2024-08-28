import { ItemType } from '@src/system/types/cosmere';
import { CharacterActor } from '@system/documents/actor';

// Mixins
import { ApplicationMixins } from '../mixins';

// Components
import {
    CharacterDetailsComponent,
    CharacterResourceComponent,
    CharacterAttributesComponent,
    CharacterSkillsGroupComponent,
    CharacterExpertisesComponent,
    CharacterAncestryComponent,
    CharacterPathsComponent,
} from './components/character';

// Base
import { BaseActorSheet } from './base';

interface ApplicationTab {
    id: string;
    group: string;
    label: string;
    icon?: string;
}

export class CharacterSheet extends ApplicationMixins(BaseActorSheet) {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ['cosmere-rpg', 'sheet', 'actor', 'character'],
        position: {
            width: 850,
            height: 1000,
        },
    });

    static COMPONENTS = foundry.utils.mergeObject(super.COMPONENTS, {
        'app-character-details': CharacterDetailsComponent,
        'app-character-resource': CharacterResourceComponent,
        'app-character-attributes': CharacterAttributesComponent,
        'app-character-skills-group': CharacterSkillsGroupComponent,
        'app-character-expertises': CharacterExpertisesComponent,
        'app-character-ancestry': CharacterAncestryComponent,
        'app-character-paths-list': CharacterPathsComponent,
    });

    static PARTS = foundry.utils.mergeObject(super.PARTS, {
        header: {
            template: 'systems/cosmere-rpg/templates/actors/parts/header.hbs',
        },
        'sheet-content': {
            template:
                'systems/cosmere-rpg/templates/actors/parts/sheet-content.hbs',
        },
    });

    public tabGroups = {
        primary: 'actions',
    };

    protected tabs: ApplicationTab[] = [
        {
            id: 'actions',
            group: 'primary',
            label: 'COSMERE.Actor.Sheet.Actions.label',
        },
        {
            id: 'inventory',
            group: 'primary',
            label: 'COSMERE.Actor.Sheet.Inventory.label',
        },
    ];

    get actor(): CharacterActor {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return super.document;
    }

    /* --- Context --- */

    public async _prepareContext(
        options: Partial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        // Find the ancestry
        const ancestryItem = this.actor.items.find(
            (item) => item.type === ItemType.Ancestry,
        );

        // Find all paths
        const pathItems = this.actor.items.filter((item) => item.isPath());

        // Split paths by type
        const pathTypes = pathItems
            .map((item) => item.system.type)
            .filter((v, i, self) => self.indexOf(v) === i); // Filter out duplicates

        return {
            ...(await super._prepareContext(options)),

            tabs: this.tabs,
            tabGroups: this.tabGroups,

            pathTypes: pathTypes.map((type) => ({
                type,
                typeLabel: CONFIG.COSMERE.paths.types[type].label,
                paths: pathItems.filter((i) => i.system.type === type),
            })),

            // TODO: Default localization
            ancestryLabel: ancestryItem?.name ?? 'DEFAULT_ANCESTRY_LABEL',

            attributeGroups: Object.keys(CONFIG.COSMERE.attributeGroups),
            resources: Object.keys(this.actor.system.resources),
        };
    }
}
