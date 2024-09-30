import { Attribute } from '@system/types/cosmere';
import { ConstructorOf } from '@system/types/utils';

import { Prequisite, TalentPrerequisiteType } from '@system/data/item/talent';

// Dialogs
import { EditTalentPrerequisiteDialog } from '../dialogs/edit-talent-prerequisite';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { TalentItemSheet } from '../talent-sheet';
import { BaseItemSheetRenderContext } from '../base';

export class TalentPrerequisitesComponent extends HandlebarsApplicationComponent<
    ConstructorOf<TalentItemSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/item/talent/components/prerequisites.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions and forms
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static ACTIONS = {
        'create-prerequisite': this.onCreatePrerequisite,
        'edit-prerequisite': this.onEditPrerequisite,
        'delete-prerequisite': this.onDeletePrerequisite,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    private static async onCreatePrerequisite(
        this: TalentPrerequisitesComponent,
        event: Event,
    ) {
        // Create a new prerequisite
        const newRule: Prequisite = {
            type: TalentPrerequisiteType.Attribute,
            attribute: Attribute.Strength,
            value: 1,
        };

        // Generate a unique ID
        const id = foundry.utils.randomID();

        // Add the new rule to the item
        await this.application.item.update({
            [`system.prerequisites.${id}`]: newRule,
        });

        // Show the edit dialog
        await EditTalentPrerequisiteDialog.show(this.application.item, {
            id,
            ...newRule,
        });
    }

    private static onEditPrerequisite(
        this: TalentPrerequisitesComponent,
        event: Event,
    ) {
        // Get the rule ID
        const id = this.getRuleIdFromEvent(event);
        if (!id) return;

        // Get the rule data
        const rule = this.application.item.system.prerequisites[id];
        if (!rule) return;

        // Show the edit dialog
        void EditTalentPrerequisiteDialog.show(this.application.item, {
            id,
            ...rule,
        });
    }

    private static onDeletePrerequisite(
        this: TalentPrerequisitesComponent,
        event: Event,
    ) {
        // Get the rule ID
        const id = this.getRuleIdFromEvent(event);
        if (!id) return;

        // Get prerequisites
        const prerequisites = this.application.item.system.prerequisites;

        // Remove the rule
        delete prerequisites[id];

        // Update the item
        void this.application.item.update(
            { 'system.prerequisites': prerequisites },
            { diff: false },
        );
    }

    /* --- Context --- */

    public _prepareContext(params: never, context: BaseItemSheetRenderContext) {
        return Promise.resolve({
            ...context,
            ...this.preparePrerequisitesContext(),
        });
    }

    private preparePrerequisitesContext() {
        // Get the prerequisites data
        const {
            prerequisitesArray: prerequisites,
            prerequisiteTypeSelectOptions,
        } = this.application.item.system;

        return {
            prerequisites: prerequisites.map((rule) => ({
                ...rule,
                typeLabel: prerequisiteTypeSelectOptions[rule.type],
            })),
            prerequisiteTypeSelectOptions,
        };
    }

    /* --- Helpers --- */

    private getRuleIdFromEvent(event: Event) {
        // Find rule element
        const rule = $(event.currentTarget!).closest('.rule[data-id]');
        return rule.data('id') as string | undefined;
    }
}

// Register the component
TalentPrerequisitesComponent.register('app-talent-prerequisites');
