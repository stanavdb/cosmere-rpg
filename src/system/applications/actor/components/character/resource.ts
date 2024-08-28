import { Resource } from '@system/types/cosmere';
import { ConstructorOf } from '@system/types/utils';

import { Derived } from '@system/data/fields';

// Component imports
import { HandlebarsApplicationComponent } from '../../../mixins/component-handlebars-application-mixin';
import { BaseActorSheet, BaseActorSheetRenderContext } from '../../base';

// NOTE: Must use a type instead of an interface to match `AnyObject` type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Params = {
    resource: Resource;
};

export class CharacterResourceComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>,
    Params
> {
    static readonly TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/resource.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'edit-value': this.onEditValue,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    public static onEditValue(this: CharacterResourceComponent, event: Event) {
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
