import { InjuryType } from '@system/types/cosmere';
import { ConstructorOf } from '@system/types/utils';
import { CosmereItem } from '@system/documents';
import { InjuryItemDataModel } from '@system/data/item';

import AppUtils from '@system/applications/utils';

// Component imports
import { HandlebarsApplicationComponent } from '../../../mixins/component-handlebars-application-mixin';
import { BaseActorSheet, BaseActorSheetRenderContext } from '../../base';

export class CharacterInjuriesListComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/injuries-list.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'toggle-injury-controls': this.onToggleInjuryControls,
        'reduce-injury-duration': this.onDecreaseInjuryDuration,
        'increase-injury-duration': this.onIncreaseInjuryDuration,
        'edit-injury': this.onEditInjury,
        'remove-injury': this.onRemoveInjury,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    private contextId: string | null = null;
    private controlsDropdownExpanded = false;
    private controlsDropdownPosition?: { top: number; right: number };

    /* --- Actions --- */

    public static onToggleInjuryControls(
        this: CharacterInjuriesListComponent,
        event: PointerEvent,
    ) {
        this.controlsDropdownExpanded = !this.controlsDropdownExpanded;

        if (this.controlsDropdownExpanded) {
            // Get connection id
            const injuryId = $(event.currentTarget!)
                .closest('[data-item-id]')
                .data('item-id') as string;

            this.contextId = injuryId;

            const target = (event.currentTarget as HTMLElement).closest(
                '.item',
            )!;
            const targetRect = target.getBoundingClientRect();
            const rootRect = this.element.getBoundingClientRect();

            this.controlsDropdownPosition = {
                top: targetRect.bottom - rootRect.top,
                right: rootRect.right - targetRect.right,
            };
        } else {
            this.contextId = null;
        }

        void this.render();
    }

    public static onDecreaseInjuryDuration(
        this: CharacterInjuriesListComponent,
        event: Event,
    ) {
        // Get injury item
        const injuryItem = AppUtils.getItemFromEvent(
            event,
            this.application.actor,
        );
        if (!injuryItem?.isInjury()) return;

        // Reduce duration by one
        void injuryItem.update({
            'system.duration.remaining':
                injuryItem.system.duration.remaining! - 1,
        });
    }

    public static onIncreaseInjuryDuration(
        this: CharacterInjuriesListComponent,
        event: Event,
    ) {
        // Get injury item
        const injuryItem = AppUtils.getItemFromEvent(
            event,
            this.application.actor,
        );
        if (!injuryItem?.isInjury()) return;

        // Increase duration by one
        void injuryItem.update({
            'system.duration.remaining':
                injuryItem.system.duration.remaining! + 1,
        });
    }

    public static async onRemoveInjury(this: CharacterInjuriesListComponent) {
        this.controlsDropdownExpanded = false;

        // Ensure context goal id is set
        if (this.contextId !== null) {
            // Remove the connection
            await this.application.actor.deleteEmbeddedDocuments(
                'Item',
                [this.contextId],
                { render: false },
            );
        }

        // Render
        await this.render();
    }

    public static onEditInjury(this: CharacterInjuriesListComponent) {
        this.controlsDropdownExpanded = false;

        // Ensure context goal id is set
        if (this.contextId !== null) {
            // Get the connection
            const connection = this.application.actor.items.find(
                (i) => i.id === this.contextId,
            ) as CosmereItem<InjuryItemDataModel>;

            // Show connection sheet
            void connection.sheet?.render(true);
        }

        // Render
        void this.render();
    }

    /* --- Context --- */

    public _prepareContext(
        params: unknown,
        context: BaseActorSheetRenderContext,
    ) {
        // Get list of injuries
        const injuries = this.application.actor.items.filter((item) =>
            item.isInjury(),
        );

        return Promise.resolve({
            ...context,

            injuries: injuries
                .map((item) => {
                    const type = item.system.type;

                    return {
                        ...item,
                        id: item.id,
                        type,
                        typeLabel: CONFIG.COSMERE.injuries[type].label,
                        duration: item.system.duration,

                        isPermanent:
                            type === InjuryType.PermanentInjury ||
                            type === InjuryType.Death,
                    };
                })
                .sort((a, b) => {
                    const remainingA =
                        a.type === InjuryType.PermanentInjury
                            ? Number.MAX_SAFE_INTEGER
                            : (a.duration.remaining ?? 0);
                    const remainingB =
                        b.type === InjuryType.PermanentInjury
                            ? Number.MAX_SAFE_INTEGER
                            : (b.duration.remaining ?? 0);

                    return remainingB - remainingA;
                }),

            controlsDropdown: {
                expanded: this.controlsDropdownExpanded,
                position: this.controlsDropdownPosition,
            },
        });
    }
}
