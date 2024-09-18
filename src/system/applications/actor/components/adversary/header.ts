import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '../../../mixins/component-handlebars-application-mixin';
import {
    AdversarySheet,
    AdversarySheetRenderContext,
} from '../../adversary-sheet';

export class AdversaryHeaderComponent extends HandlebarsApplicationComponent<
    ConstructorOf<AdversarySheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/adversary/components/header.hbs';

    /* --- Context --- */

    public _prepareContext(
        params: never,
        context: AdversarySheetRenderContext,
    ) {
        return Promise.resolve({
            ...context,

            roleLabel:
                CONFIG.COSMERE.adversary.roles[context.actor.system.role].label,
            sizeLabel: CONFIG.COSMERE.sizes[context.actor.system.size].label,
            typeLabel:
                CONFIG.COSMERE.creatureTypes[context.actor.system.type].label,
        });
    }
}
