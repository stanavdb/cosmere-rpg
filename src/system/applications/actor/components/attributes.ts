import { AttributeGroup, Attribute } from '@system/types/cosmere';
import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '../../mixins/component-handlebars-application-mixin';
import { BaseActorSheet, BaseActorSheetRenderContext } from '../base';

export class ActorAttributesComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/components/attributes.hbs';

    /* --- Context --- */

    public _prepareContext(
        params: object,
        context: BaseActorSheetRenderContext,
    ) {
        return Promise.resolve({
            ...context,

            attributeGroups: (
                Object.keys(CONFIG.COSMERE.attributeGroups) as AttributeGroup[]
            ).map(this.prepareAttributeGroup.bind(this)),
        });
    }

    private prepareAttributeGroup(groupId: AttributeGroup) {
        // Get the attribute group config
        const groupConfig = CONFIG.COSMERE.attributeGroups[groupId];

        return {
            id: groupId,
            config: groupConfig,
            defense: this.application.actor.system.defenses[groupId],
            attributes: groupConfig.attributes.map(
                this.prepareAttribute.bind(this),
            ),
        };
    }

    private prepareAttribute(attrId: Attribute) {
        // Get the attribute config
        const attrConfig = CONFIG.COSMERE.attributes[attrId];

        return {
            id: attrId,
            config: attrConfig,
            ...this.application.actor.system.attributes[attrId],
        };
    }
}
