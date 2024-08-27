import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsComponent } from '../../../mixins/component-handlebars-application-mixin';
import { BaseActorSheetRenderContext } from '../../base';
import { CharacterSheet } from '../../character-sheet';

export class CharacterPathsComponent extends HandlebarsComponent<
    ConstructorOf<CharacterSheet>
> {
    static readonly TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/paths.hbs';

    /* --- Context --- */

    public _prepareContext(
        params: object,
        context: BaseActorSheetRenderContext,
    ) {
        // Find all paths
        const pathItems = this.application.actor.items.filter((item) =>
            item.isPath(),
        );

        return Promise.resolve({
            ...context,

            paths: pathItems.map((path) => ({
                ...path,
                typeLabel: CONFIG.COSMERE.paths.types[path.system.type].label,
                level: this.application.actor.system.level.paths[
                    path.system.id
                ],
            })),
        });
    }
}
