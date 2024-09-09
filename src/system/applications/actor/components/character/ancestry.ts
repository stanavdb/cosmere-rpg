import { ItemType } from '@system/types/cosmere';
import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '../../../mixins/component-handlebars-application-mixin';
import { BaseActorSheet, BaseActorSheetRenderContext } from '../../base';

export class CharacterAncestryComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/ancestry.hbs';

    /* --- Context --- */

    public _prepareContext(
        params: object,
        context: BaseActorSheetRenderContext,
    ) {
        // Find the ancestry
        const ancestryItem = this.application.actor.items.find(
            (item) => item.type === ItemType.Ancestry,
        );

        return Promise.resolve({
            ...context,

            ...(ancestryItem
                ? {
                      ancestry: {
                          label: ancestryItem?.name,
                      },
                  }
                : {}),
        });
    }
}
