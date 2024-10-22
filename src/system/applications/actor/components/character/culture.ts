import { CultureItem } from '@system/documents/item';

import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseActorSheetRenderContext } from '../../base';
import { CharacterSheet } from '../../character-sheet';

// NOTE: Must use type here instead of interface as an interface doesn't match AnyObject type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Params = {
    culture: CultureItem;
};

export class CharacterCultureComponent extends HandlebarsApplicationComponent<
    ConstructorOf<CharacterSheet>,
    Params
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/culture.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static ACTIONS = {
        remove: this.onRemove,
        view: this.onView,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    private static onRemove(this: CharacterCultureComponent) {
        void this.params!.culture.delete();
    }

    private static onView(this: CharacterCultureComponent) {
        void this.params!.culture.sheet?.render(true);
    }

    /* --- Context --- */

    public _prepareContext(
        params: Params,
        context: BaseActorSheetRenderContext,
    ) {
        return Promise.resolve({
            ...context,

            culture: {
                label: params.culture.name,
                img: params.culture.img,
            },
        });
    }
}

// Register the component
CharacterCultureComponent.register('app-character-culture');
