import { Resource } from '@system/types/cosmere';
import { ConstructorOf } from '@system/types/utils';

import { Derived } from '@system/data/fields';

// Dialog
import { ConfigureResourceDialog } from '../dialogs/configure-resource';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseActorSheet, BaseActorSheetRenderContext } from '../base';

// NOTE: Must use a type instead of an interface to match `AnyObject` type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Params = {
    resource: Resource;
};

export class ActorResourceComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>,
    Params
> {
    static readonly TEMPLATE =
        'systems/cosmere-rpg/templates/actors/components/resource.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'edit-value': this.onEditValue,
        'configure-resource': this.onConfigureResource,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    public static onEditValue(this: ActorResourceComponent, event: Event) {
        if (!this.application.isEditable) return;

        const resourceBarElement = $(event.target!).closest(
            '.bar:not(.editing)',
        );
        if (resourceBarElement.length === 0) return;

        // Add editing class
        resourceBarElement.addClass('editing');

        // Get input element
        const inputElement = resourceBarElement.find('input');

        inputElement.on('focusout', () => {
            inputElement.off('focusout');

            // Remove editing class
            resourceBarElement.removeClass('editing');
        });

        setTimeout(() => {
            inputElement.trigger('select');
        });
    }

    private static async onConfigureResource(
        this: ActorResourceComponent,
        event: Event,
    ) {
        // Get the resource id
        const resourceId = $(event.target ?? event.currentTarget!)
            .closest('[data-id]')
            .data('id') as Resource;

        // Show dialog
        await ConfigureResourceDialog.show(this.application.actor, resourceId);
    }

    /* --- Context --- */

    public _prepareContext(
        params: Params,
        context: BaseActorSheetRenderContext,
    ) {
        // Get resource
        const resource = context.actor.system.resources[params.resource];

        // Get resource config
        const config = CONFIG.COSMERE.resources[params.resource];

        // Get value and max
        const value = resource.value;
        const max = Derived.getValue(resource.max);

        return Promise.resolve({
            ...context,

            resource: {
                id: params.resource,
                label: config.label,
                value,
                max,
            },
        });
    }
}

// Register
ActorResourceComponent.register('app-actor-resource');
