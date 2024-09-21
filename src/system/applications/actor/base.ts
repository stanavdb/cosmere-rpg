import { Resource } from '@src/system/types/cosmere';
import { CosmereActor } from '@system/documents/actor';
import { DeepPartial, AnyObject } from '@system/types/utils';

// Utils
import AppUtils from '@system/applications/utils';

// Mixins
import {
    TabsApplicationMixin,
    DragDropApplicationMixin,
    ComponentHandlebarsApplicationMixin,
    ComponentHandlebarsRenderOptions,
} from '@system/applications/mixins';

// Components
import {
    ActorDetailsComponent,
    ActorResourceComponent,
    ActorAttributesComponent,
    ActorActionsListComponent,
    ActorSearchBarComponent,
    ActorConditionsComponent,
    ActorInjuriesListComponent,
    ActorEquipmentListComponent,
    ActorEffectsListComponent,
    SortDirection,
    SearchBarInputEvent,
} from './components';

const { ActorSheetV2 } = foundry.applications.sheets;

export type ActorSheetMode = 'view' | 'edit';

export const enum BaseSheetTab {
    Actions = 'actions',
    Equipment = 'equipment',
    Effects = 'effects',
}

// NOTE: Have to use type instead of interface to comply with AnyObject type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type BaseActorSheetRenderContext = {
    actor: CosmereActor;
};

export class BaseActorSheet<
    T extends BaseActorSheetRenderContext = BaseActorSheetRenderContext,
> extends TabsApplicationMixin(
    DragDropApplicationMixin(ComponentHandlebarsApplicationMixin(ActorSheetV2)),
)<T> {
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.mergeObject({}, super.DEFAULT_OPTIONS),
        {
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

    static COMPONENTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.COMPONENTS),
        {
            'app-actor-details': ActorDetailsComponent,
            'app-actor-resource': ActorResourceComponent,
            'app-actor-attributes': ActorAttributesComponent,
            'app-actor-actions-list': ActorActionsListComponent,
            'app-actor-search-bar': ActorSearchBarComponent,
            'app-actor-conditions': ActorConditionsComponent,
            'app-actor-injuries-list': ActorInjuriesListComponent,
            'app-actor-equipment-list': ActorEquipmentListComponent,
            'app-actor-effects-list': ActorEffectsListComponent,
        },
    );

    static PARTS = foundry.utils.mergeObject(super.PARTS, {
        navigation: {
            template:
                'systems/cosmere-rpg/templates/actors/parts/navigation.hbs',
        },
    });

    static TABS = foundry.utils.mergeObject(super.TABS, {
        [BaseSheetTab.Actions]: {
            label: 'COSMERE.Actor.Sheet.Tabs.Actions',
            icon: '<i class="cosmere-icon">3</i>',
        },
        [BaseSheetTab.Equipment]: {
            label: 'COSMERE.Actor.Sheet.Tabs.Equipment',
            icon: '<i class="fa-solid fa-suitcase"></i>',
        },
        [BaseSheetTab.Effects]: {
            label: 'COSMERE.Actor.Sheet.Tabs.Effects',
            icon: '<i class="fa-solid fa-bolt"></i>',
        },
    });

    get actor(): CosmereActor {
        return super.document;
    }

    protected actionsSearchText = '';
    protected actionsSearchSort: SortDirection = SortDirection.Descending;

    protected equipmentSearchText = '';
    protected equipmentSearchSort: SortDirection = SortDirection.Descending;

    protected effectsSearchText = '';
    protected effectsSearchSort: SortDirection = SortDirection.Descending;

    /* --- Accessors --- */

    public get mode(): ActorSheetMode {
        return this.actor.getFlag('cosmere-rpg', 'sheet.mode') ?? 'edit';
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

    protected override _onDrop(event: DragEvent) {
        const data = TextEditor.getDragEventData(event) as unknown as {
            type: string;
            uuid: string;
        };

        // Ensure document type can be embedded on actor
        if (!(data.type in CosmereActor.metadata.embedded)) return;

        // Get the document
        const document = fromUuidSync(data.uuid);
        if (!document) return;

        if (document.parent !== this.actor) {
            // Document not yet on this actor, create it
            void this.actor.createEmbeddedDocuments(data.type, [document]);
        }
    }

    /* --- Actions --- */

    public static async onToggleMode(this: BaseActorSheet, event: Event) {
        if (!(event.target instanceof HTMLInputElement)) return;

        // Stop event propagation
        event.stopPropagation();

        // Update the actor
        await this.actor.update(
            {
                'flags.cosmere-rpg.sheet.mode':
                    this.mode === 'view' ? 'edit' : 'view',
            },
            { render: false },
        );

        // Render the sheet
        void this.render(true);

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
        if (
            !(event.target instanceof HTMLInputElement) &&
            !(event.target instanceof HTMLTextAreaElement) &&
            !(event.target instanceof HTMLSelectElement)
        )
            return;
        if (!event.target.name) return;

        Object.keys(this.actor.system.resources).forEach((resourceId) => {
            let resourceValue = formData.object[
                `system.resources.${resourceId}.value`
            ] as string;

            // Clean the value
            resourceValue = resourceValue
                .replace(/[^-+\d]/g, '')
                .replace(/((?<=\d+)\b.*)|((\+|-)*(?=(\+|-)\d))/g, '');

            // Get the number value
            let numValue = Number(resourceValue.replace(/\+|-/, ''));
            numValue = isNaN(numValue) ? 0 : numValue;

            if (resourceValue.includes('-'))
                numValue =
                    this.actor.system.resources[resourceId as Resource].value -
                    numValue;
            else if (resourceValue.includes('+'))
                numValue =
                    this.actor.system.resources[resourceId as Resource].value +
                    numValue;

            formData.object[`system.resources.${resourceId}.value`] = numValue;
        });

        // Update document
        void this.actor.update(formData.object, { diff: false });
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
                    data-tooltip="COSMERE.Actor.Sheet.Edit"
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

    /* --- Lifecycle --- */

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

    /* --- Event handlers --- */

    protected onActionsSearchChange(event: SearchBarInputEvent) {
        this.actionsSearchText = event.detail.text;
        this.actionsSearchSort = event.detail.sort;

        void this.render({
            parts: [],
            componentRefs: ['sheet-content.app-actor-actions-list.0'],
        });
    }

    protected onEquipmentSearchChange(event: SearchBarInputEvent) {
        this.equipmentSearchText = event.detail.text;
        this.equipmentSearchSort = event.detail.sort;

        void this.render({
            parts: [],
            componentRefs: ['sheet-content.app-actor-equipment-list.0'],
        });
    }

    protected onEffectsSearchChange(event: SearchBarInputEvent) {
        this.effectsSearchText = event.detail.text;
        this.effectsSearchSort = event.detail.sort;

        void this.render({
            parts: [],
            componentRefs: [
                'sheet-content.app-actor-effects-list.0',
                'sheet-content.app-actor-effects-list.1',
                'sheet-content.app-actor-effects-list.2',
            ],
        });
    }

    /* --- Context --- */

    public async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        return {
            ...(await super._prepareContext(options)),
            actor: this.actor,

            editable: this.isEditable,
            mode: this.mode,
            isEditMode: this.mode === 'edit' && this.isEditable,

            resources: Object.keys(this.actor.system.resources),
            attributeGroups: Object.keys(CONFIG.COSMERE.attributeGroups),

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
