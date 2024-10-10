import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseItemSheet, BaseItemSheetRenderContext } from '../base';
import { AncestryItem } from '@src/system/documents';

interface TalentListItem {
    id: string;
    name: string;
    level: number;
    edit: boolean;
}

export class ItemTalentsListComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseItemSheet>
> {
    // state toggle
    protected addMode = false;

    private talentList: TalentListItem[] = /*(
        this.application.item as AncestryItem
    ).system.advancement.extraTalents.map((talent) => {
        return { ...talent, edit: false };
    });*/ [];

    static TEMPLATE =
        'systems/cosmere-rpg/templates/item/components/talents-list.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static ACTIONS = {
        'add-talent': this.onCreateEffect,
        'edit-talent': this.onEditEffect,
        'edit-submit': this.onEditFinishEffect,
        'edit-cancel': this.onCancelEffect,
        'delete-talent': this.onDeleteEffect,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    public static async onCreateEffect(this: ItemTalentsListComponent) {
        this.addMode = true;
        await this.render();
    }

    public static async onCancelEffect(
        this: ItemTalentsListComponent,
        event: Event,
    ) {
        if (
            $(event.currentTarget as HTMLElement).closest('#cancel-new')
                .length > 0
        ) {
            // is new entry cancel
            this.addMode = false;
        } else {
            const talent = this.getTalentFromEvent(event);
            talent!.edit = false;
        }
        await this.render();
    }

    public static async onEditEffect(
        this: ItemTalentsListComponent,
        event: Event,
    ) {
        const talent = this.getTalentFromEvent(event);
        if (!talent) return;

        talent.edit = true;
        await this.render();
    }

    public static async onDeleteEffect(
        this: ItemTalentsListComponent,
        event: Event,
    ) {
        const talentToRemove = this.getTalentFromEvent(event);
        if (!talentToRemove) return;

        // Delete effect
        this.talentList = this.talentList.filter(
            (talent) => talent !== talentToRemove,
        );
        await this.updateParent();
        await this.render();
    }

    private async updateParent() {
        await this.application.item.update({
            'system.advancement.extraTalents': this.talentList.map((talent) => {
                const { edit, ...talentGrant } = talent;
                return talentGrant;
            }),
        });
    }

    public static async onEditFinishEffect(
        this: ItemTalentsListComponent,
        event: Event,
    ) {
        const enteredTalent = this.newTalentFromElement(event);
        const existingTalent = this.getTalentFromEvent(event);

        if (!enteredTalent && !existingTalent) return;
        if (enteredTalent && !existingTalent && enteredTalent.id !== '') {
            this.talentList.push(enteredTalent);
            this.addMode = false;
        } else if (existingTalent) {
            this.talentList.findSplice(
                (talent) => existingTalent.id === talent.id,
                enteredTalent,
            );
        } else {
            return;
        }
        this.talentList.sort((a, b) => a.level - b.level);

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
            talents: this.talentList,
            addMode: this.addMode,
        });
    }

    /* --- Helpers --- */

    private getTalentFromEvent(event: Event): TalentListItem | undefined {
        if (!event.target && !event.currentTarget) return;

        const eventId = this.getTalentIdFromEvent(event);

        return this.talentList.find((talent) => talent.id === eventId);
    }

    private getTalentIdFromEvent(event: Event): string {
        return (event.currentTarget as HTMLElement).id.split('-')[1];
    }

    newTalentFromElement(event: Event): TalentListItem | undefined {
        if (!event.target && !event.currentTarget) return;

        let talentFields: NodeListOf<Element> | undefined = undefined;
        if (
            $(event.currentTarget as HTMLElement).closest('#submit-new')
                .length > 0
        ) {
            // dealing with a new entry
            talentFields = this.element?.querySelectorAll(
                '#new-id, #new-name, #new-level',
            );
        } else {
            // existing item
            const id = this.getTalentIdFromEvent(event);
            talentFields = this.element?.querySelectorAll(
                `#id-${id}, #name-${id}, #level-${id}`,
            );
        }

        if (!talentFields || talentFields.length === 0) return;
        const newTalent = {
            id: '',
            name: '',
            level: 0,
            edit: false,
        };
        talentFields.forEach((talent) => {
            if (talent.id.includes('name')) {
                newTalent.name = talent.children.item(0)!.innerHTML.trim();
            } else if (talent.id.includes('level')) {
                newTalent.level = Number.fromString(
                    talent.children.item(0)!.innerHTML.trim(),
                );
            } else {
                newTalent.id = talent.children.item(0)!.innerHTML.trim();
            }
        });
        return newTalent;
    }
}

// Register the component
ItemTalentsListComponent.register('app-item-talents-list');
