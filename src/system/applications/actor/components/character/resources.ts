import { Resource } from '@system/types/cosmere';
import { ConstructorOf } from '@system/types/utils';

import { Derived } from '@system/data/fields';

// Component imports
import { HandlebarsComponent } from '../../../mixins/component-handlebars-application-mixin';
import { BaseActorSheet, BaseActorSheetRenderContext } from '../../base';

export class CharacterResourcesComponent extends HandlebarsComponent<
    ConstructorOf<BaseActorSheet>
> {
    static readonly TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/resources.hbs';

    /* --- Context --- */

    public _prepareContext(
        params: object,
        context: BaseActorSheetRenderContext,
    ) {
        return Promise.resolve({
            ...context,
            resources: (
                Object.keys(context.actor.system.resources) as Resource[]
            ).map((resourceId) => {
                // Get resource
                const resource = context.actor.system.resources[resourceId];

                // Get resource config
                const config = CONFIG.COSMERE.resources[resourceId];

                // Get value and max
                const value = resource.value;
                const max = Derived.getValue(resource.max);

                return {
                    id: resourceId,
                    label: config.label,
                    value,
                    max,
                };
            }),
        });
    }
}
