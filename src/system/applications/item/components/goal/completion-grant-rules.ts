import { Skill } from '@system/types/cosmere';
import { Goal } from '@system/types/item';
import { CosmereItem, GoalItem, PowerItem } from '@system/documents/item';
import { ConstructorOf } from '@system/types/utils';

// Dialogs
import { EditGrantRuleDialog } from '@system/applications/item/dialogs/goal/edit-grant-rule';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { GoalItemSheet } from '@system/applications/item';

// NOTE: Must use a type instead of an interface to match `AnyObject` type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Params = {
    rules: Collection<Goal.GrantRule>;
    editable?: boolean;
};

export class GoalCompletionGrantRulesComponent extends HandlebarsApplicationComponent<
    ConstructorOf<GoalItemSheet>,
    Params
> {
    static readonly TEMPLATE =
        'systems/cosmere-rpg/templates/item/goal/components/completion-grant-rules.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'create-rule': this.onCreateRule,
        'edit-rule': this.onEditRule,
        'remove-rule': this.onRemoveRule,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    private static async onCreateRule(
        this: GoalCompletionGrantRulesComponent,
        event: Event,
    ) {
        // Create a new rule
        const newRule: Goal.GrantRule = {
            type: Goal.GrantType.SkillRanks,
            skill: Object.keys(CONFIG.COSMERE.skills)[0] as Skill,
            ranks: 1,
        };

        // Generate a unique ID
        const id = foundry.utils.randomID();

        // Add the new rule to the item
        await this.application.item.update({
            [`system.onCompletion.grants.${id}`]: newRule,
        });

        // Show the edit dialog
        await EditGrantRuleDialog.show(this.application.item, {
            _id: id,
            ...newRule,
        });
    }

    private static async onEditRule(
        this: GoalCompletionGrantRulesComponent,
        event: Event,
    ) {
        // Get id
        const id = $(event.target!).closest('[data-id]').data('id') as
            | string
            | undefined;
        if (!id) return;

        // Get rule
        const rule = this.application.item.system.onCompletion.grants.get(id);
        if (!rule) return;

        // Show the edit dialog
        await EditGrantRuleDialog.show(this.application.item, {
            _id: id,
            ...rule,
        });
    }

    private static async onRemoveRule(
        this: GoalCompletionGrantRulesComponent,
        event: Event,
    ) {
        // Get id
        const id = $(event.target!).closest('[data-id]').data('id') as
            | string
            | undefined;
        if (!id) return;

        // Remove the rule
        await this.application.item.update({
            [`system.onCompletion.grants.-=${id}`]: null,
        });
    }

    /* --- Context --- */

    public async _prepareContext(params: Params) {
        const rules = await Promise.all(
            params.rules.map(async (rule) => {
                if (rule.type !== Goal.GrantType.Power) return rule;

                // Look up doc
                const doc = (await fromUuid(
                    rule.power,
                )) as unknown as PowerItem | null;

                return {
                    ...rule,
                    link: doc?.toAnchor().outerHTML,
                };
            }),
        );

        return Promise.resolve({
            ...params,
            rules,
            editable: params.editable !== false,
        });
    }
}

// Register the component
GoalCompletionGrantRulesComponent.register('app-goal-completion-grant-rules');
