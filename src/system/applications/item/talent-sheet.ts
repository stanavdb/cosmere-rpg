import { TalentType } from '@system/types/cosmere';
import { TalentItem } from '@system/documents/item';
import { DeepPartial } from '@system/types/utils';

// Base
import { BaseItemSheet } from './base';

export class TalentItemSheet extends BaseItemSheet {
    /**
     * NOTE: Unbound methods is the standard for defining actions and forms
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            classes: ['cosmere-rpg', 'sheet', 'item', 'talent'],
            position: {
                width: 550,
            },
            window: {
                resizable: true,
                positioned: true,
            },
            form: {
                handler: this.onFormEvent,
            } as unknown,
        },
    );
    /* eslint-enable @typescript-eslint/unbound-method */

    static TABS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.TABS),
        {
            details: {
                label: 'COSMERE.Item.Sheet.Tabs.Details',
                sortIndex: 15,
            },
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            'sheet-content': {
                template:
                    'systems/cosmere-rpg/templates/item/talent/parts/sheet-content.hbs',
            },
        },
    );

    get item(): TalentItem {
        return super.document;
    }

    /* --- Form --- */

    protected static onFormEvent(
        this: TalentItemSheet,
        event: Event,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        if (
            'system.path' in formData.object &&
            formData.object['system.path'] === ''
        )
            formData.set('system.path', null);

        // Invoke super
        super.onFormEvent(event, form, formData);
    }

    /* --- Context --- */

    public async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        return {
            ...(await super._prepareContext(options)),
            isPathTalent: this.item.system.type === TalentType.Path,
            isAncestryTalent: this.item.system.type === TalentType.Ancestry,
        };
    }
}
