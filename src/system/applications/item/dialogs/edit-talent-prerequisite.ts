import { Attribute, Skill } from '@system/types/cosmere';
import { TalentItem } from '@system/documents/item';
import { AnyObject } from '@system/types/utils';
import {
    TalentItemData,
    TalentPrerequisiteType,
} from '@system/data/item/talent';

const { ApplicationV2 } = foundry.applications.api;

import { ComponentHandlebarsApplicationMixin } from '@system/applications/component-system';

type PrerequisiteData = {
    id: string;
} & TalentItemData['prerequisites'][keyof TalentItemData['prerequisites']];

export class EditTalentPrerequisiteDialog extends ComponentHandlebarsApplicationMixin(
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
                title: 'DIALOG.EditTalentPrerequisite.Title',
                minimizable: false,
                resizable: true,
                positioned: true,
            },
            classes: ['dialog', 'edit-talent-prerequisite'],
            tag: 'dialog',
            position: {
                width: 350,
            },
            actions: {
                update: this.onUpdatePrerequisite,
            },
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            form: {
                template:
                    'systems/cosmere-rpg/templates/item/talent/dialogs/edit-prerequisite.hbs',
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
        private talent: TalentItem,
        private data: PrerequisiteData,
    ) {
        super({
            id: `${talent.uuid}.Prerequisite.${data.id}`,
        });
    }

    /* --- Statics --- */

    public static async show(talent: TalentItem, data: PrerequisiteData) {
        const dialog = new this(talent, data);
        await dialog.render(true);
    }

    /* --- Actions --- */

    private static onUpdatePrerequisite(this: EditTalentPrerequisiteDialog) {
        if (
            this.data.type === TalentPrerequisiteType.Attribute &&
            isNaN(this.data.value)
        ) {
            this.data.value = 1;
        } else if (
            this.data.type === TalentPrerequisiteType.Skill &&
            isNaN(this.data.rank)
        ) {
            this.data.rank = 1;
        }

        void this.talent.update({
            [`system.prerequisites.${this.data.id}`]: this.data,
        });
        void this.close();
    }

    /* --- Form --- */

    protected static onFormEvent(
        this: EditTalentPrerequisiteDialog,
        event: Event,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        if (event instanceof SubmitEvent) return;

        // Get type
        const type = formData.get('type') as TalentPrerequisiteType;
        this.data.type = type;

        if (this.data.type === TalentPrerequisiteType.Attribute) {
            this.data.attribute = (formData.get('attribute') ??
                Object.keys(CONFIG.COSMERE.attributes)[0]) as Attribute;
            this.data.value = parseInt(formData.get('value') as string, 10);
        } else if (this.data.type === TalentPrerequisiteType.Skill) {
            this.data.skill = (formData.get('skill') ??
                Object.keys(CONFIG.COSMERE.skills)[0]) as Skill;
            this.data.rank = parseInt(formData.get('rank') as string, 10);
        } else if (this.data.type === TalentPrerequisiteType.Talent) {
            this.data.talent = formData.get('talent') as string;
        } else if (this.data.type === TalentPrerequisiteType.Connection) {
            this.data.description = formData.get('description') as string;
        }

        // Render
        void this.render(true);
    }

    /* --- Lifecycle --- */

    protected _onRender(): void {
        $(this.element).prop('open', true);
    }

    /* --- Context --- */

    public _prepareContext(): Promise<AnyObject> {
        return Promise.resolve({
            editable: true,
            ...this.data,
            typeSelectOptions: this.talent.system.prerequisiteTypeSelectOptions,
            attributeSelectOptions: Object.entries(
                CONFIG.COSMERE.attributes,
            ).reduce(
                (acc, [key, config]) => ({
                    ...acc,
                    [key]: config.label,
                }),
                {},
            ),
            skillSelectOptions: Object.entries(CONFIG.COSMERE.skills).reduce(
                (acc, [key, config]) => ({
                    ...acc,
                    [key]: config.label,
                }),
                {},
            ),
        });
    }
}
