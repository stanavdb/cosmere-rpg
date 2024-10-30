import { ItemType } from '@system/types/cosmere';
import { GoalItem } from '@system/documents/item';
import { ConstructorOf, MouseButton } from '@system/types/utils';
import { SYSTEM_ID } from '@src/system/constants';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseActorSheetRenderContext } from '../../base';

import { CharacterSheet } from '../../character-sheet';

const HIDE_COMPLETED_FLAG = 'goals.hide-completed';

export class CharacterGoalsListComponent extends HandlebarsApplicationComponent<
    ConstructorOf<CharacterSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/character/components/goals-list.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'toggle-goal-controls': this.onToggleGoalControls,
        'adjust-goal-progress': {
            handler: this.onAdjustGoalProgress,
            buttons: [MouseButton.Primary, MouseButton.Secondary],
        },
        'toggle-hide-completed-goals': this.onToggleHideCompletedGoals,
        'edit-goal': this.onEditGoal,
        'remove-goal': this.onRemoveGoal,
        'add-goal': this.onAddGoal,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    private contextGoalId: string | null = null;
    private controlsDropdownExpanded = false;
    private controlsDropdownPosition?: { top: number; right: number };

    /* --- Actions --- */

    public static onToggleGoalControls(
        this: CharacterGoalsListComponent,
        event: PointerEvent,
    ) {
        this.controlsDropdownExpanded = !this.controlsDropdownExpanded;

        if (this.controlsDropdownExpanded) {
            // Get goal id
            const goalId = $(event.currentTarget!)
                .closest('[data-id]')
                .data('id') as string;

            this.contextGoalId = goalId;

            const target = (event.currentTarget as HTMLElement).closest(
                '.goal',
            )!;
            const targetRect = target.getBoundingClientRect();
            const rootRect = this.element!.getBoundingClientRect();

            this.controlsDropdownPosition = {
                top: targetRect.bottom - rootRect.top,
                right: rootRect.right - targetRect.right,
            };
        } else {
            this.contextGoalId = null;
        }

        void this.render();
    }

    public static async onAdjustGoalProgress(
        this: CharacterGoalsListComponent,
        event: Event,
    ) {
        if (!this.application.isEditable) return;

        const incrementBool: boolean = event.type === 'click' ? true : false;

        // Get goal id
        const goalId = $(event.currentTarget!)
            .closest('[data-id]')
            .data('id') as string | undefined;
        if (!goalId) return;

        // Get the goal
        const goalItem = this.application.actor.items.get(goalId);
        if (!goalItem?.isGoal()) return;

        // Get the goal's current level
        const currentLevel = goalItem.system.level;

        // Calculate the new level
        const newLevel = incrementBool
            ? Math.min(currentLevel + 1, 3)
            : Math.max(currentLevel - 1, 0);

        // Update the goal
        await goalItem.update({
            'system.level': newLevel,
        });

        // Render
        await this.render();
    }

    public static async onToggleHideCompletedGoals(
        this: CharacterGoalsListComponent,
    ) {
        // Get current state
        const hideCompletedGoals =
            this.application.actor.getFlag<boolean>(
                SYSTEM_ID,
                HIDE_COMPLETED_FLAG,
            ) ?? false;

        // Update
        await this.application.actor.update(
            {
                [`flags.cosmere-rpg.${HIDE_COMPLETED_FLAG}`]:
                    !hideCompletedGoals,
            },
            { render: false },
        );

        // Close controls dropdown if it happens to be open
        this.controlsDropdownExpanded = false;

        // Render
        await this.render();
    }

    public static async onEditGoal(this: CharacterGoalsListComponent) {
        this.controlsDropdownExpanded = false;

        // Render
        await this.render();

        // Ensure context goal id is set
        if (this.contextGoalId !== null) {
            // Get the goal
            const goalItem = this.application.actor.items.get(
                this.contextGoalId,
            );
            if (!goalItem?.isGoal()) return;

            // Show item sheet
            void goalItem.sheet?.render(true);
        }
    }

    public static async onRemoveGoal(this: CharacterGoalsListComponent) {
        this.controlsDropdownExpanded = false;

        // Ensure context goal id is set
        if (this.contextGoalId !== null) {
            // Get the goal
            const goalItem = this.application.actor.items.get(
                this.contextGoalId,
            );
            if (!goalItem?.isGoal()) return;

            // Delete the goal
            await goalItem.delete();
        }
    }

    public static async onAddGoal(this: CharacterGoalsListComponent) {
        // Ensure controls dropdown is closed
        this.controlsDropdownExpanded = false;

        // Get the goals
        const goals = this.application.actor.system.goals;
        if (!goals) return;

        // Create goal
        const goal = (await Item.create(
            {
                type: ItemType.Goal,
                name: game.i18n!.localize(
                    'COSMERE.Actor.Sheet.Details.Goals.NewText',
                ),
                system: {
                    level: 0,
                },
            },
            { parent: this.application.actor },
        )) as GoalItem;

        // Show item sheet
        void goal.sheet?.render(true);
    }

    /* --- Context --- */

    public async _prepareContext(
        params: never,
        context: BaseActorSheetRenderContext,
    ) {
        const hideCompletedGoals =
            this.application.actor.getFlag<boolean>(
                SYSTEM_ID,
                HIDE_COMPLETED_FLAG,
            ) ?? false;

        return Promise.resolve({
            ...context,

            goals: this.application.actor.goals
                .map((goal) => ({
                    id: goal.id,
                    name: goal.name,
                    level: goal.system.level,
                    achieved: goal.system.level === 3,
                }))
                .filter((goal) => !hideCompletedGoals || !goal.achieved),

            hideCompletedGoals,

            controlsDropdown: {
                expanded: this.controlsDropdownExpanded,
                position: this.controlsDropdownPosition,
            },
        });
    }
}

// Register
CharacterGoalsListComponent.register('app-character-goals-list');
