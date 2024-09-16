import { Resource } from '@src/system/types/cosmere';
import { CosmereActor } from '@system/documents/actor';
import { DeepPartial } from '@system/types/utils';

// Mixins
import {
    TabsApplicationMixin,
    DragDropApplicationMixin,
    ComponentHandlebarsApplicationMixin,
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

    static COMPONENTS = foundry.utils.mergeObject(super.COMPONENTS, {
        'app-actor-details': ActorDetailsComponent,
        'app-actor-resource': ActorResourceComponent,
        'app-actor-attributes': ActorAttributesComponent,
        'app-actor-actions-list': ActorActionsListComponent,
        'app-actor-search-bar': ActorSearchBarComponent,
        'app-actor-conditions': ActorConditionsComponent,
        'app-actor-injuries-list': ActorInjuriesListComponent,
    });

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

    /* --- Accessors --- */

    public get mode(): ActorSheetMode {
        return this.actor.getFlag('cosmere-rpg', 'sheetMode') ?? 'edit';
    }

    /* --- Actions --- */

    public static async onToggleMode(this: BaseActorSheet, event: Event) {
        if (!(event.target instanceof HTMLInputElement)) return;

        // Stop event propagation
        event.stopPropagation();

        // Update the actor
        await this.actor.update(
            {
                'flags.cosmere-rpg.sheetMode':
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
            !(event.target instanceof HTMLTextAreaElement)
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
        };
    }
}
