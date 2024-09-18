import { ActorType } from '@system/types/cosmere';
import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '../../mixins/component-handlebars-application-mixin';
import { BaseActorSheet, BaseActorSheetRenderContext } from '../base';

export class ActorDetailsComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/components/details.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'short-rest': this.onShortRest,
        'long-rest': this.onLongRest,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    private static onShortRest(this: ActorDetailsComponent) {
        void this.application.actor.shortRest();
    }

    private static onLongRest(this: ActorDetailsComponent) {
        void this.application.actor.longRest();
    }

    /* --- Context --- */

    public _prepareContext(
        params: never,
        context: BaseActorSheetRenderContext,
    ) {
        const actor = context.actor;

        return Promise.resolve({
            ...context,

            type: actor.type,
            displayRestButtons: actor.type === ActorType.Character,
            displayRecovery: actor.type === ActorType.Character,
        });
    }
}
