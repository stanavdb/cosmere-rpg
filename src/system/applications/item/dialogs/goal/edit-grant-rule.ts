import { Skill } from '@system/types/cosmere';
import { GoalItem } from '@system/documents/item';
import { Goal } from '@system/types/item';
import { AnyObject } from '@system/types/utils';

const { ApplicationV2 } = foundry.applications.api;

import { ComponentHandlebarsApplicationMixin } from '@system/applications/component-system';

type GrantRuleData = {
    _id: string;
} & Goal.GrantRule;

export class EditGrantRuleDialog extends ComponentHandlebarsApplicationMixin(
    ApplicationV2<AnyObject>,
) {
    /**
     * NOTE: Unbound methods is the standard for defining actions and forms
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            window: {
                title: 'DIALOG.EditGrantRule.Title',
                minimizable: false,
                resizable: true,
                positioned: true,
            },
            classes: ['dialog', 'edit-grant-rule'],
            tag: 'dialog',
            position: {
                width: 425,
            },
            actions: {
                update: this.onUpdateGrantRule,
            },
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            form: {
                template:
                    'systems/cosmere-rpg/templates/item/goal/dialogs/edit-grant-rule.hbs',
                forms: {
                    form: {
                        handler: this.onFormEvent,
                        submitOnChange: true,
                    },
                },
            },
        },
    );
    /* eslint-enable @typescript-eslint/unbound-method */

    private constructor(
        private goal: GoalItem,
        private rule: GrantRuleData,
    ) {
        super({
            id: `${goal.uuid}.OnCompletion.Grants.${rule._id}`,
            window: {
                title: 'DIALOG.EditGrantRule.Title',
            },
        });
    }

    /* --- Statics --- */

    public static async show(goal: GoalItem, rule: GrantRuleData) {
        const dialog = new this(goal, foundry.utils.deepClone(rule));
        await dialog.render(true);
    }

    /* --- Actions --- */

    private static async onUpdateGrantRule(this: EditGrantRuleDialog) {
        // Validate
        if (
            this.rule.type === Goal.GrantType.SkillRanks &&
            (this.rule.skill === null || this.rule.ranks === null)
        ) {
            ui.notifications.error(
                'COSMERE.Item.Goal.GrantRule.Validation.MissingSkillOrRanks',
            );
            return;
        } else if (
            this.rule.type === Goal.GrantType.Power &&
            this.rule.power === null
        ) {
            ui.notifications.error(
                'COSMERE.Item.Goal.GrantRule.Validation.MissingPower',
            );
            return;
        }

        // Prepare updates
        const updates =
            this.rule.type === Goal.GrantType.SkillRanks
                ? {
                      type: this.rule.type,
                      skill: this.rule.skill,
                      ranks: this.rule.ranks,
                  }
                : {
                      type: this.rule.type,
                      power: this.rule.power,
                  };

        // Perform updates
        await this.goal.update({
            [`system.onCompletion.grants.${this.rule._id}`]: updates,
        });

        // Close
        void this.close();
    }

    /* --- Form --- */

    protected static onFormEvent(
        this: EditGrantRuleDialog,
        event: Event,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        if (event instanceof SubmitEvent) return;

        // Get type
        const type = formData.get('type') as Goal.GrantType;
        this.rule.type = type;

        if (
            this.rule.type === Goal.GrantType.SkillRanks &&
            formData.has('skill')
        ) {
            foundry.utils.mergeObject(this.rule, {
                skill: formData.get('skill') as Skill,
                ranks: parseInt(formData.get('ranks') as string, 10),
            });
        } else if (
            this.rule.type === Goal.GrantType.Power &&
            formData.has('power')
        ) {
            foundry.utils.mergeObject(this.rule, {
                power: formData.get('power') as string,
            });
        }

        // Render
        void this.render(true);
    }

    /* --- Lifecycle --- */

    protected _onRender(context: AnyObject, options: AnyObject): void {
        super._onRender(context, options);

        $(this.element).prop('open', true);
    }

    /* --- Context --- */

    public _prepareContext() {
        return Promise.resolve({
            goal: this.goal,
            ...this.rule,

            schema: this.goal.system.schema._getField([
                'onCompletion',
                'grants',
                'model',
            ]),
        });
    }
}
