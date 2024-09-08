import { ConstructorOf } from '@system/types/utils';

// Utils
import AppUtils from '@system/applications/utils';

// Component imports
import { HandlebarsApplicationComponent } from '../../../mixins/component-handlebars-application-mixin';
import { CharacterSheet } from '../../character-sheet';
import { BaseActorSheetRenderContext } from '../../base';

export class CharacterFavoritesComponent extends HandlebarsApplicationComponent<
    ConstructorOf<CharacterSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/favorites.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'use-item': this.onUseItem,
        'remove-favorite': this.onRemoveFavorite,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    public static onUseItem(this: CharacterFavoritesComponent, event: Event) {
        // Get item
        const item = AppUtils.getItemFromEvent(event, this.application.actor);
        if (!item) return;

        // Use the item
        void this.application.actor.useItem(item);
    }

    public static onRemoveFavorite(
        this: CharacterFavoritesComponent,
        event: Event,
    ) {
        // Get item
        const item = AppUtils.getItemFromEvent(event, this.application.actor);
        if (!item) return;

        // Remove favorite
        void item.clearFavorite();
    }

    /* --- Context --- */

    public _prepareContext(
        params: never,
        context: BaseActorSheetRenderContext,
    ) {
        return Promise.resolve({
            ...context,

            favorites: this.application.actor.favorites,
        });
    }
}
