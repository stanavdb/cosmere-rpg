import { ConstructorOf, MouseButton } from '@system/types/utils';

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

    private contextGoalId: number | null = null;
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
                .data('id') as number;

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
            .data('id') as number;

        // Get the goals
        const goals = this.application.actor.system.goals;

        // Modify the goal
        goals[goalId].level += incrementBool ? 1 : -1;
        goals[goalId].level = Math.max(0, Math.min(3, goals[goalId].level));

        // Adjust the rank
        await this.application.actor.update(
            {
                'system.goals': goals,
            },
            { render: false },
        );

        // Render
        await this.render();
    }

    public static async onToggleHideCompletedGoals(
        this: CharacterGoalsListComponent,
    ) {
        // Get current state
        const hideCompletedGoals =
            this.application.actor.getFlag<boolean>(
                'cosmere-rpg',
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
            // Edit the goal
            this.editGoal(this.contextGoalId);
        }
    }

    public static async onRemoveGoal(this: CharacterGoalsListComponent) {
        this.controlsDropdownExpanded = false;

        // Ensure context goal id is set
        if (this.contextGoalId !== null) {
            // Get goals
            const goals = this.application.actor.system.goals;

            // Update the goals
            goals.splice(this.contextGoalId, 1);

            // Update actor
            await this.application.actor.update(
                {
                    'system.goals': goals,
                },
                { render: false },
            );
        }

        // Render
        await this.render();
    }

    public static async onAddGoal(this: CharacterGoalsListComponent) {
        // Ensure controls dropdown is closed
        this.controlsDropdownExpanded = false;

        // Get the goals
        const goals = this.application.actor.system.goals;

        // Add new goal
        goals.push({
            text: game.i18n!.localize(
                'COSMERE.Actor.Sheet.Details.Goals.NewText',
            ),
            level: 0,
        });

        // Update the actor
        await this.application.actor.update(
            {
                'system.goals': goals,
            },
            { render: false },
        );

        // Render
        await this.render();

        // Edit goal
        this.editGoal(goals.length - 1);
    }

    /* --- Context --- */

    public _prepareContext(
        params: never,
        context: BaseActorSheetRenderContext,
    ) {
        const hideCompletedGoals =
            this.application.actor.getFlag<boolean>(
                'cosmere-rpg',
                HIDE_COMPLETED_FLAG,
            ) ?? false;

        return Promise.resolve({
            ...context,

            goals: this.application.actor.system.goals
                .map((goal) => ({
                    ...goal,
                    achieved: goal.level === 3,
                }))
                .filter((goal) => !hideCompletedGoals || !goal.achieved),

            hideCompletedGoals,

            controlsDropdown: {
                expanded: this.controlsDropdownExpanded,
                position: this.controlsDropdownPosition,
            },
        });
    }

    /* --- Helpers --- */

    private editGoal(index: number) {
        // Get goal element
        const element = $(this.element!).find(`.goal[data-id="${index}"]`);

        // Get span element
        const span = element.find('span.title');

        // Hide span title
        span.addClass('inactive');

        // Get input element
        const input = element.find('input.title');

        // Show
        input.removeClass('inactive');

        setTimeout(() => {
            // Focus input
            input.trigger('select');

            // Add event handler
            input.on('focusout', async () => {
                // Remove handler
                input.off('focusout');

                // Get the goals
                const goals = this.application.actor.system.goals;

                // Modify the goal
                goals[index].text = input.val() as string;

                // Update value
                await this.application.actor.update({
                    'system.goals': goals,
                });

                // Render
                void this.render();
            });

            input.on('keypress', (event) => {
                if (event.which !== 13) return; // Enter key

                event.preventDefault();
                event.stopPropagation();

                input.trigger('focusout');
            });
        });
    }
}

// Register
CharacterGoalsListComponent.register('app-character-goals-list');
