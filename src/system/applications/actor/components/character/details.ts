import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsComponent } from '../../../mixins/component-handlebars-application-mixin';
import { BaseActorSheet } from '../../base';

export class CharacterDetailsComponent extends HandlebarsComponent<
    ConstructorOf<BaseActorSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/details.hbs';
}
