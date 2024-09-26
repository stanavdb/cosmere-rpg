import { AttributeGroup, Skill } from '@system/types/cosmere';
import { ConstructorOf, MouseButton } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseActorSheet, BaseActorSheetRenderContext } from '../base';

// NOTE: Must use type here instead of interface as an interface doesn't match AnyObject type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Params = {
    'group-id': AttributeGroup;
};

export class ActorSkillsGroupComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>,
    Params
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/components/skills-group.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'roll-skill': this.onRollSkill,
        'adjust-skill-rank': {
            handler: this.onAdjustSkillRank,
            buttons: [MouseButton.Primary, MouseButton.Secondary],
        },
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    public static onRollSkill(this: ActorSkillsGroupComponent, event: Event) {
        event.preventDefault();

        const skillId = $(event.currentTarget!)
            .closest('[data-id]')
            .data('id') as Skill;
        void this.application.actor.rollSkill(skillId);
    }

    public static async onAdjustSkillRank(
        this: ActorSkillsGroupComponent,
        event: Event,
    ) {
        event.preventDefault();

        const incrementBool: boolean = event.type === 'click' ? true : false;

        // Get skill id
        const skillId = $(event.currentTarget!)
            .closest('[data-id]')
            .data('id') as Skill;

        // Modify skill rank
        await this.application.actor.modifySkillRank(skillId, incrementBool);
    }

    /* --- Context --- */

    public _prepareContext(
        params: Params,
        context: BaseActorSheetRenderContext,
    ) {
        // Get the attribute group config
        const groupConfig = CONFIG.COSMERE.attributeGroups[params['group-id']];

        // Get the skill ids
        const skillIds = groupConfig.attributes
            .map((attrId) => CONFIG.COSMERE.attributes[attrId])
            .map((attr) => attr.skills)
            .flat()
            .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

        return Promise.resolve({
            ...context,

            id: params['group-id'],

            skills: skillIds
                .map((skillId) => ({
                    id: skillId,
                    config: CONFIG.COSMERE.skills[skillId],
                    ...this.application.actor.system.skills[skillId],
                    active:
                        !CONFIG.COSMERE.skills[skillId].hiddenUntilAcquired ||
                        this.application.actor.system.skills[skillId].rank >= 1,
                }))
                .sort((a, b) => {
                    const _a = a.config.hiddenUntilAcquired ? 1 : 0;
                    const _b = b.config.hiddenUntilAcquired ? 1 : 0;
                    return _a - _b;
                }),
        });
    }
}

// Register
ActorSkillsGroupComponent.register('app-actor-skills-group');
