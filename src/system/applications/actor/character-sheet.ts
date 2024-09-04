import { ItemType } from '@src/system/types/cosmere';
import { CharacterActor } from '@system/documents/actor';

// Mixins
import {
    ComponentHandlebarsApplicationMixin,
    ComponentHandlebarsRenderOptions,
} from '../mixins';
import { TabsApplicationMixin } from './mixins/tabs';

// Components
import {
    CharacterDetailsComponent,
    CharacterResourceComponent,
    CharacterAttributesComponent,
    CharacterSkillsGroupComponent,
    CharacterExpertisesComponent,
    CharacterAncestryComponent,
    CharacterPathsComponent,
    CharacterActionsListComponent,
    CharacterSearchBarComponent,
    SearchBarInputEvent,
    SortDirection,
    CharacterEquipmentListComponent,
    CharacterGoalsListComponent,
    CharacterConnectionsListComponent,
} from './components/character';

// Base
import { BaseActorSheet } from './base';
import { AnyObject } from '@src/system/types/utils';

const enum CharacterSheetTab {
    Details = 'details',
    Actions = 'actions',
    Equipment = 'equipment',
    Goals = 'goals',
    Effects = 'effects',
}

export class CharacterSheet extends TabsApplicationMixin(
    ComponentHandlebarsApplicationMixin(BaseActorSheet),
) {
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ['cosmere-rpg', 'sheet', 'actor', 'character'],
        position: {
            width: 850,
            height: 1000,
        },
        actions: {
            'toggle-mode': this.onToggleMode,
        },
        form: {
            handler: this.onFormEvent,
            submitOnChange: true,
        } as unknown,
    });
    /* eslint-enable @typescript-eslint/unbound-method */

    static COMPONENTS = foundry.utils.mergeObject(super.COMPONENTS, {
        'app-character-details': CharacterDetailsComponent,
        'app-character-resource': CharacterResourceComponent,
        'app-character-attributes': CharacterAttributesComponent,
        'app-character-skills-group': CharacterSkillsGroupComponent,
        'app-character-expertises': CharacterExpertisesComponent,
        'app-character-ancestry': CharacterAncestryComponent,
        'app-character-paths-list': CharacterPathsComponent,
        'app-character-actions-list': CharacterActionsListComponent,
        'app-character-search-bar': CharacterSearchBarComponent,
        'app-character-equipment-list': CharacterEquipmentListComponent,
        'app-character-goals-list': CharacterGoalsListComponent,
        'app-character-connections-list': CharacterConnectionsListComponent,
    });

    static PARTS = foundry.utils.mergeObject(super.PARTS, {
        navigation: {
            template:
                'systems/cosmere-rpg/templates/actors/character/parts/navigation.hbs',
        },
        header: {
            template:
                'systems/cosmere-rpg/templates/actors/character/parts/header.hbs',
        },
        'sheet-content': {
            template:
                'systems/cosmere-rpg/templates/actors/character/parts/sheet-content.hbs',
        },
    });

    static TABS = foundry.utils.mergeObject(super.TABS, {
        [CharacterSheetTab.Details]: {
            label: 'COSMERE.Actor.Sheet.Tabs.Details',
            icon: '<i class="fa-solid fa-feather-pointed"></i>',
        },
        [CharacterSheetTab.Actions]: {
            label: 'COSMERE.Actor.Sheet.Tabs.Actions',
            icon: '<i class="cosmere-icon">3</i>',
        },
        [CharacterSheetTab.Equipment]: {
            label: 'COSMERE.Actor.Sheet.Tabs.Equipment',
            icon: '<i class="fa-solid fa-suitcase"></i>',
        },
        [CharacterSheetTab.Goals]: {
            label: 'COSMERE.Actor.Sheet.Tabs.Goals',
            icon: '<i class="fa-solid fa-list"></i>',
        },
        [CharacterSheetTab.Effects]: {
            label: 'COSMERE.Actor.Sheet.Tabs.Effects',
            icon: '<i class="fa-solid fa-bolt"></i>',
        },
    });

    get actor(): CharacterActor {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return super.document;
    }

    private actionsSearchText = '';
    private actionsSearchSort: SortDirection = SortDirection.Descending;

    private equipmentSearchText = '';
    private equipmentSearchSort: SortDirection = SortDirection.Descending;

    /* --- Actions --- */

    public static onToggleMode(this: CharacterSheet, event: Event) {
        if (!(event.target instanceof HTMLInputElement)) return;

        super.onToggleMode(event);

        // Get toggle
        const toggle = $(this.element).find('#mode-toggle');

        // Update checked status
        toggle.find('input').prop('checked', this.mode === 'edit');

        // Update tooltip
        toggle.attr(
            'data-tooltip',
            game.i18n!.localize(
                `COSMERE.Actor.Sheet.${this.mode === 'edit' ? 'View' : 'Edit'}`,
            ),
        );
    }

    /* --- Form --- */

    public static onFormEvent(
        this: BaseActorSheet,
        event: Event,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        super.onFormEvent(event, form, formData);
    }

    /* --- Life cycle --- */

    protected _onRender(
        context: AnyObject,
        options: ComponentHandlebarsRenderOptions,
    ) {
        if (options.parts.includes('sheet-content')) {
            this.element
                .querySelector('#actions-search')!
                .addEventListener(
                    'search',
                    this.onActionsSearchChange.bind(this) as EventListener,
                );

            this.element
                .querySelector('#equipment-search')
                ?.addEventListener(
                    'search',
                    this.onEquipmentSearchChange.bind(this) as EventListener,
                );
        }
    }

    protected async _renderFrame(
        options: Partial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ): Promise<HTMLElement> {
        const frame = await super._renderFrame(options);

        // Insert mode toggle
        if (this.isEditable) {
            $(this.window.title!).before(`
                <label id="mode-toggle" 
                    class="toggle-switch"
                    data-action="toggle-mode"
                    data-tooltip="${game.i18n!.localize('COSMERE.Actor.Sheet.Edit')}"
                >
                    <input type="checkbox" ${this.mode === 'edit' ? 'checked' : ''}>
                    <div class="slider rounded">
                        <i class="fa-solid fa-pen"></i>
                    </div>
                </label>
            `);
        }

        return frame;
    }

    /* --- Event handlers --- */

    private onActionsSearchChange(event: SearchBarInputEvent) {
        this.actionsSearchText = event.detail.text;
        this.actionsSearchSort = event.detail.sort;

        void this.render({
            parts: [],
            componentRefs: ['sheet-content.app-character-actions-list.0'],
        });
    }

    private onEquipmentSearchChange(event: SearchBarInputEvent) {
        this.equipmentSearchText = event.detail.text;
        this.equipmentSearchSort = event.detail.sort;

        void this.render({
            parts: [],
            componentRefs: ['sheet-content.app-character-equipment-list.0'],
        });
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

            pathTypes: pathTypes.map((type) => ({
                type,
                typeLabel: CONFIG.COSMERE.paths.types[type].label,
                paths: pathItems.filter((i) => i.system.type === type),
            })),

            // TODO: Default localization
            ancestryLabel:
                ancestryItem?.name ??
                game.i18n?.localize('COSMERE.Item.Type.Ancestry.label'),

            attributeGroups: Object.keys(CONFIG.COSMERE.attributeGroups),
            resources: Object.keys(this.actor.system.resources),

            // Search
            actionsSearch: {
                text: this.actionsSearchText,
                sort: this.actionsSearchSort,
            },
            equipmentSearch: {
                text: this.equipmentSearchText,
                sort: this.equipmentSearchSort,
            },
        };
    }
}
