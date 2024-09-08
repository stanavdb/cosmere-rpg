import { Condition } from '@system/types/cosmere';
import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '../../../mixins/component-handlebars-application-mixin';
import { BaseActorSheetRenderContext } from '../../base';
import { CharacterSheet } from '../../character-sheet';

export class CharacterConditionsComponent extends HandlebarsApplicationComponent<
    ConstructorOf<CharacterSheet>
> {
    static readonly TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/conditions.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'toggle-condition-active': this.onToggleConditionActive,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    public static async onToggleConditionActive(
        this: CharacterConditionsComponent,
        event: Event,
    ) {
        // Get condition
        const condition = $(event.target!)
            .closest('[data-id]')
            .data('id') as Condition;

        // Toggle the status effect for the condition
        await this.application.actor.toggleStatusEffect(condition);
    }

    /* --- Context --- */

    public _prepareContext(
        params: object,
        context: BaseActorSheetRenderContext,
    ) {
        return Promise.resolve({
            ...context,

            conditions: (
                Object.keys(CONFIG.COSMERE.conditions) as Condition[]
            ).map((id) => {
                // Get the config
                const config = CONFIG.COSMERE.conditions[id];

                return {
                    id,
                    name: config.label,
                    icon: config.icon,
                    active: this.application.actor.conditions.has(id),
                };
            }),
        });
    }
}
