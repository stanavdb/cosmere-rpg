import { ConstructorOf } from '@system/types/utils';

// Dialogs
import { EditCreatureTypeDialog } from '@system/applications/actor/dialogs/edit-creature-type';

// Utils
import ActorUtils from '@system/util/actor';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import {
    AdversarySheet,
    AdversarySheetRenderContext,
} from '../../adversary-sheet';

export class AdversaryHeaderComponent extends HandlebarsApplicationComponent<
    ConstructorOf<AdversarySheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/adversary/components/header.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static ACTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.ACTIONS),
        {
            'edit-type': this.onEditType,
        },
    );
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    private static onEditType(this: AdversaryHeaderComponent) {
        void EditCreatureTypeDialog.show(this.application.actor);
    }

    /* --- Context --- */

    public _prepareContext(
        params: never,
        context: AdversarySheetRenderContext,
    ) {
        return Promise.resolve({
            ...context,

            roles: Object.entries(CONFIG.COSMERE.adversary.roles).reduce(
                (roles, [id, config]) => ({
                    ...roles,
                    [id]: config.label,
                }),
                {} as Record<string, string>,
            ),
            sizes: Object.entries(CONFIG.COSMERE.sizes).reduce(
                (sizes, [id, config]) => ({
                    ...sizes,
                    [id]: config.label,
                }),
                {} as Record<string, string>,
            ),

            roleLabel:
                CONFIG.COSMERE.adversary.roles[context.actor.system.role].label,
            sizeLabel: CONFIG.COSMERE.sizes[context.actor.system.size].label,
            typeLabel: ActorUtils.getTypeLabel(context.actor.system.type),
        });
    }
}

// Register
AdversaryHeaderComponent.register('app-adversary-header');
