import { ConstructorOf } from '@system/types/utils';
import { CosmereItem } from '@system/documents';

import { AppContextMenu } from '@system/applications/utils/context-menu';

// Component imports
import { HandlebarsApplicationComponent } from '../../../mixins/component-handlebars-application-mixin';
import { BaseActorSheet, BaseActorSheetRenderContext } from '../../base';
import { SortDirection } from './search-bar';

type EffectListType = 'inactive' | 'passive' | 'temporary';

// NOTE: Must use type here instead of interface as an interface doesn't match AnyObject type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Params = {
    type: EffectListType;
};

interface RenderContext extends BaseActorSheetRenderContext {
    effectsSearch: {
        text: string;
        sort: SortDirection;
    };
}

// Constants
const TITLE_MAP: Record<EffectListType, string> = {
    inactive: 'COSMERE.Actor.Sheet.Effects.Inactive',
    passive: 'COSMERE.Actor.Sheet.Effects.Passive',
    temporary: 'COSMERE.Actor.Sheet.Effects.Temporary',
};

export class CharacterEffectsListComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>,
    Params
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/effects-list.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'toggle-effect-active': this.onToggleEffectActive,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    public static onToggleEffectActive(
        this: CharacterEffectsListComponent,
        event: Event,
    ) {
        const effect = this.getEffectFromEvent(event);
        if (!effect) return;

        // Toggle active
        void effect.update({
            disabled: !effect.disabled,
        });
    }

    /* --- Context --- */

    public _prepareContext(params: Params, context: RenderContext) {
        // Get effects
        let effects = this.application.actor.applicableEffects
            .filter((effect) => !effect.id.startsWith('cond'))
            .filter((effect) =>
                effect.name.toLowerCase().includes(context.effectsSearch.text),
            )
            .sort(
                (a, b) =>
                    a.name.compare(b.name) *
                    (context.effectsSearch.sort === SortDirection.Descending
                        ? 1
                        : -1),
            );

        // Filter effects down to the correct type
        if (params.type === 'inactive') {
            effects = effects.filter((effect) => !effect.active);
        } else if (params.type === 'passive') {
            effects = effects.filter(
                (effect) => effect.active && !effect.isTemporary,
            );
        } else if (params.type === 'temporary') {
            effects = effects.filter(
                (effect) => effect.active && effect.isTemporary,
            );
        }

        // Set context
        return Promise.resolve({
            ...context,
            effectsTitle: TITLE_MAP[params.type],
            effects,
        });
    }

    /* --- Lifecycle --- */

    public _onInitialize(): void {
        if (this.application.isEditable) {
            // Create context menu
            AppContextMenu.create(
                this,
                'right',
                [
                    {
                        name: 'GENERIC.Button.Edit',
                        icon: 'fa-solid fa-pen-to-square',
                        callback: (element) => {
                            const effect = this.getEffectFromElement(element);
                            if (!effect) return;

                            void effect.sheet?.render(true);
                        },
                    },
                    {
                        name: 'GENERIC.Button.Remove',
                        icon: 'fa-solid fa-trash',
                        callback: (element) => {
                            const effect = this.getEffectFromElement(element);
                            if (!effect) return;

                            void effect.parent?.deleteEmbeddedDocuments(
                                'ActiveEffect',
                                [effect.id],
                            );
                        },
                    },
                ],
                'a[data-action="toggle-effect-controls"]',
            );
        }
    }

    /* --- Helpers --- */

    private getEffectFromEvent(event: Event): ActiveEffect | undefined {
        if (!event.target && !event.currentTarget) return;

        return this.getEffectFromElement(
            (event.target ?? event.currentTarget) as HTMLElement,
        );
    }

    private getEffectFromElement(
        element: HTMLElement,
    ): ActiveEffect | undefined {
        const effectElement = $(element).closest('.effect[data-id]');

        // Get the id
        const id = effectElement.data('id') as string;

        // Get the parent id (if it exists)
        const parentId = effectElement.data('parent-id') as string | undefined;

        // Get the effect
        return this.getEffect(id, parentId);
    }

    private getEffect(
        effectId: string,
        parentId?: string,
    ): ActiveEffect | undefined {
        if (!parentId)
            return this.application.actor.getEmbeddedDocument(
                'ActiveEffect',
                effectId,
            ) as ActiveEffect | undefined;
        else {
            // Get item
            const item = this.application.actor.getEmbeddedDocument(
                'Item',
                parentId,
            ) as CosmereItem | undefined;
            return item?.getEmbeddedDocument('ActiveEffect', effectId) as
                | ActiveEffect
                | undefined;
        }
    }
}
