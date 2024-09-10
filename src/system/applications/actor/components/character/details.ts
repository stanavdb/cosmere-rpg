import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '../../../mixins/component-handlebars-application-mixin';
import { BaseActorSheet } from '../../base';

export class CharacterDetailsComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/details.hbs';

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

    private static onShortRest(this: CharacterDetailsComponent) {
        void this.application.actor.shortRest();
    }

    private static onLongRest(this: CharacterDetailsComponent) {
        void this.application.actor.longRest();
    }
}
