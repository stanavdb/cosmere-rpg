import { ItemType } from '@system/types/cosmere';
import { CharacterActor, CosmereActor, CosmereItem } from '@system/documents';
import { AnyObject } from '@system/types/utils';

// Mixins
import {
    TabsApplicationMixin,
    DragDropApplicationMixin,
    ComponentHandlebarsApplicationMixin,
    ComponentHandlebarsRenderOptions,
} from '@system/applications/mixins';

import AppUtils from '../utils';

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
    CharacterConditionsComponent,
    CharacterInjuriesListComponent,
    CharacterEffectsListComponent,
    CharacterFavoritesComponent,
} from './components/character';

// Base
import { BaseActorSheet } from './base';

const enum CharacterSheetTab {
    Details = 'details',
    Actions = 'actions',
    Equipment = 'equipment',
    Goals = 'goals',
    Effects = 'effects',
}

export class CharacterSheet extends TabsApplicationMixin(
    DragDropApplicationMixin(
        ComponentHandlebarsApplicationMixin(BaseActorSheet),
    ),
) {
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.mergeObject({}, super.DEFAULT_OPTIONS),
        {
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
            dragDrop: [
                {
                    dragSelector: '[data-drag]',
                    dropSelector: '*',
                },
            ],
        },
    );
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
        'app-character-conditions': CharacterConditionsComponent,
        'app-character-injuries-list': CharacterInjuriesListComponent,
        'app-character-effects-list': CharacterEffectsListComponent,
        'app-character-favorites': CharacterFavoritesComponent,
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
        return super.document;
    }

    private actionsSearchText = '';
    private actionsSearchSort: SortDirection = SortDirection.Descending;

    private equipmentSearchText = '';
    private equipmentSearchSort: SortDirection = SortDirection.Descending;

    private effectsSearchText = '';
    private effectsSearchSort: SortDirection = SortDirection.Descending;

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
        super._onRender(context, options);

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

            this.element
                .querySelector('#effects-search')
                ?.addEventListener(
                    'search',
                    this.onEffectsSearchChange.bind(this) as EventListener,
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

    private onEffectsSearchChange(event: SearchBarInputEvent) {
        this.effectsSearchText = event.detail.text;
        this.effectsSearchSort = event.detail.sort;

        void this.render({
            parts: [],
            componentRefs: [
                'sheet-content.app-character-effects-list.0',
                'sheet-content.app-character-effects-list.1',
                'sheet-content.app-character-effects-list.2',
            ],
        });
    }

    /* --- Drag drop --- */

    protected override _canDragStart(): boolean {
        return this.isEditable;
    }

    protected override _canDragDrop(): boolean {
        return this.isEditable;
    }

    protected override _onDragStart(event: DragEvent) {
        // Get dragged item
        const item = AppUtils.getItemFromEvent(event, this.actor);
        if (!item) return;

        const dragData = {
            type: 'Item',
            uuid: item.uuid,
        };

        // Set data transfer
        event.dataTransfer!.setData('text/plain', JSON.stringify(dragData));
        event.dataTransfer!.setData('document/item', ''); // Mark the type
    }

    // TODO: Move favorites drag and drop logic over to component
    protected override _onDragOver(event: DragEvent) {
        if (!event.dataTransfer?.types.includes('document/item')) return;

        // Clean up
        $(this.element)
            .find('app-character-favorites .drop-area')
            .removeClass('dropping');
        $(this.element)
            .find('app-character-favorites .drop-indicator')
            .remove();

        if ($(event.target!).closest('app-character-favorites').length) {
            if ($(event.target!).closest('.drop-area').length) {
                $(event.target!).closest('.drop-area').addClass('dropping');
            } else if ($(event.target!).closest('.favorite.item').length) {
                const el = $(event.target!)
                    .closest('.favorite.item')
                    .get(0) as HTMLElement;

                // Get bounding rect
                const bounds = el.getBoundingClientRect();

                if (event.clientY < bounds.top + bounds.height / 2) {
                    $(el).before(`<li class="drop-indicator"></li>`);
                } else {
                    $(el).after(`<li class="drop-indicator"></li>`);
                }
            }
        }
    }

    // TODO: Move favorites drag and drop logic over to component
    protected override async _onDrop(event: DragEvent) {
        const data = TextEditor.getDragEventData(event) as unknown as {
            type: string;
            uuid: string;
        };

        // Ensure document type can be embedded on actor
        if (!(data.type in CosmereActor.metadata.embedded)) return;

        // Get the document
        const document = fromUuidSync(data.uuid);
        if (!document) return;

        if (document.parent === this.actor) {
            // Document already on this actor
            if (data.type !== 'Item') return;

            const item = document as CosmereItem;

            if ($(event.target!).closest('app-character-favorites').length) {
                if (
                    $(event.target!).closest('.drop-area').length &&
                    !item.isFavorite
                ) {
                    // Mark item as favorited
                    void item.markFavorite(
                        this.actor.favorites.length, // Insert at the end
                    );
                } else if ($(event.target!).closest('.favorite.item').length) {
                    const el = $(event.target!)
                        .closest('.favorite.item')
                        .get(0) as HTMLElement;

                    // Get the index
                    let index = $(event.target!)
                        .closest('app-character-favorites')
                        .find('.favorite.item')
                        .toArray()
                        .indexOf(el);

                    // Get bounding rect
                    const bounds = el.getBoundingClientRect();

                    // If item is dropped below the current element, move index over by 1
                    if (event.clientY > bounds.top + bounds.height / 2) {
                        index++;
                    }

                    await Promise.all([
                        // Increase index of all subsequent favorites
                        ...this.actor.favorites
                            .slice(index)
                            .map((item, i) =>
                                item.markFavorite(index + i + 1, false),
                            ),

                        // Mark as favorite
                        item.markFavorite(index, false),
                    ]);

                    // Normalize
                    this.actor.favorites.forEach(
                        (item, i) => void item.markFavorite(i, false),
                    );

                    // Render
                    void this.render(true);
                }
            }

            // Clean up
            $(this.element)
                .find('app-character-favorites .drop-area')
                .removeClass('dropping');
            $(this.element)
                .find('app-character-favorites .drop-indicator')
                .remove();
        } else {
            // Document not yet on this actor, create it
            void this.actor.createEmbeddedDocuments(data.type, [document]);
        }
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
            ancestryLabel: ancestryItem?.name ?? 'DEFAULT_ANCESTRY_LABEL',

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
            effectsSearch: {
                text: this.effectsSearchText,
                sort: this.effectsSearchSort,
            },
        };
    }
}
