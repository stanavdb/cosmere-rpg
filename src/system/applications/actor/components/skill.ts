import { Skill } from '@system/types/cosmere';
import { ConstructorOf, MouseButton } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseActorSheet, BaseActorSheetRenderContext } from '../base';

// NOTE: Must use a type instead of an interface to match `AnyObject` type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Params = {
    /**
     * The skill to display
     */
    skill: Skill;

    /**
     * Whether to display the rank pips
     *
     * @default true
     */
    pips?: boolean;

    /**
     * Whether the skill is read-only
     *
     * @default false
     */
    readonly?: boolean;
};

export class ActorSkillComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>,
    Params
> {
    static readonly TEMPLATE =
        'systems/cosmere-rpg/templates/actors/components/skill.hbs';

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

    public static onRollSkill(this: ActorSkillComponent, event: Event) {
        event.preventDefault();

        const skillId = $(event.currentTarget!)
            .closest('[data-id]')
            .data('id') as Skill;
        void this.application.actor.rollSkill(skillId);
    }

    public static async onAdjustSkillRank(
        this: ActorSkillComponent,
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

    /* --- Accessors --- */

    public get readonly() {
        return this.params?.readonly === true;
    }

    public get pips() {
        return this.params?.pips !== false;
    }

    /* --- Context --- */

    public _prepareContext(
        params: Params,
        context: BaseActorSheetRenderContext,
    ) {
        // Get skill
        const skill = this.application.actor.system.skills[params.skill];

        // Get skill config
        const config = CONFIG.COSMERE.skills[params.skill];

        // Get attribute config
        const attributeConfig = CONFIG.COSMERE.attributes[config.attribute];

        return Promise.resolve({
            ...context,

            skill: {
                ...skill,
                id: params.skill,
                label: config.label,
                attribute: config.attribute,
                attributeLabel: attributeConfig.labelShort,
            },

            editable: !this.readonly,
            pips: this.pips,
        });
    }
}

// Register the component
ActorSkillComponent.register('app-actor-skill');
