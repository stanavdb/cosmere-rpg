import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseItemSheet, BaseItemSheetRenderContext } from '../base';
import { AncestryItem } from '@src/system/documents';

interface TalentPickListItem {
    level: number;
    quantity: number;
    edit: boolean;
}

export class ItemTalentPicksListComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseItemSheet>
> {
    // state toggle
    protected addMode = false;

    private list: TalentPickListItem[] = (
        this.application.item as AncestryItem
    ).system.advancement.extraTalentPicks.levels.map((pick) => {
        return { ...pick, edit: false };
    });

    static TEMPLATE =
        'systems/cosmere-rpg/templates/item/components/talent-picks-list.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static ACTIONS = {
        'add-pick': this.onCreateEffect,
        'edit-pick': this.onEditEffect,
        'edit-submit': this.onEditFinishEffect,
        'edit-cancel': this.onCancelEffect,
        'delete-pick': this.onDeleteEffect,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    public static async onCreateEffect(this: ItemTalentPicksListComponent) {
        this.addMode = true;
        await this.render();
    }

    public static async onCancelEffect(
        this: ItemTalentPicksListComponent,
        event: Event,
    ) {
        if (
            $(event.currentTarget as HTMLElement).closest('#cancel-new')
                .length > 0
        ) {
            // is new entry cancel
            this.addMode = false;
        } else {
            const talent = this.getRowFromEvent(event);
            talent!.edit = false;
        }
        await this.render();
    }

    public static async onEditEffect(
        this: ItemTalentPicksListComponent,
        event: Event,
    ) {
        const row = this.getRowFromEvent(event);
        if (!row) return;

        row.edit = true;
        await this.render();
    }

    public static async onDeleteEffect(
        this: ItemTalentPicksListComponent,
        event: Event,
    ) {
        const rowToRemove = this.getRowFromEvent(event);
        if (!rowToRemove) return;

        // Delete effect
        this.list = this.list.filter(
            (talentPick) => talentPick !== rowToRemove,
        );
        await this.updateParent();
        await this.render();
    }

    private async updateParent() {
        await this.application.item.update({
            'system.advancement.extraTalentPicks.levels': this.list.map(
                (pick) => {
                    const { edit, ...talentPick } = pick;
                    return talentPick;
                },
            ),
        });
    }

    public static async onEditFinishEffect(
        this: ItemTalentPicksListComponent,
        event: Event,
    ) {
        const enteredFields = this.newTalentPickFromElement(event);
        const existingPick = this.getRowFromEvent(event);

        if (!enteredFields && !existingPick) return;
        if (enteredFields && !existingPick && enteredFields.level !== 0) {
            this.list.push(enteredFields);
            this.addMode = false;
        } else if (existingPick) {
            this.list.findSplice(
                (pick) => existingPick.level === pick.level,
                enteredFields,
            );
        } else {
            return;
        }
        this.list.sort((a, b) => a.level - b.level);

        await this.updateParent();
        await this.render();
    }

    /* --- Context --- */

    public _prepareContext(
        params: Record<string, unknown>,
        context: BaseItemSheetRenderContext,
    ) {
        return Promise.resolve({
            ...context,
            talentPicks: this.list,
            addMode: this.addMode,
        });
    }

    /* --- Helpers --- */

    private getRowFromEvent(event: Event): TalentPickListItem | undefined {
        if (!event.target && !event.currentTarget) return;

        const eventLevel = this.getLevelFromEvent(event);

        return this.list.find((pick) => pick.level === eventLevel);
    }

    private getLevelFromEvent(event: Event): number {
        return Number.fromString(
            (event.currentTarget as HTMLElement).id.split('-')[1],
        );
    }

    newTalentPickFromElement(event: Event): TalentPickListItem | undefined {
        if (!event.target && !event.currentTarget) return;

        let enteredFields: NodeListOf<Element> | undefined = undefined;
        if (
            $(event.currentTarget as HTMLElement).closest('#submit-new')
                .length > 0
        ) {
            // dealing with a new entry
            enteredFields = this.element?.querySelectorAll(
                '#new-level, #new-quantity',
            );
        } else {
            // existing item
            const level = this.getLevelFromEvent(event);
            enteredFields = this.element?.querySelectorAll(
                `#level-${level}, #quantity-${level}`,
            );
        }

        if (!enteredFields || enteredFields.length === 0) return;
        const newRow = {
            level: 0,
            quantity: 0,
            edit: false,
        };
        enteredFields.forEach((pick) => {
            if (pick.id.includes('level')) {
                newRow.level = Number.fromString(
                    pick.children.item(0)!.innerHTML.trim(),
                );
            } else {
                newRow.quantity = Number.fromString(
                    pick.children.item(0)!.innerHTML.trim(),
                );
            }
        });
        return newRow;
    }
}

// Register the component
ItemTalentPicksListComponent.register('app-item-talent-picks-list');
