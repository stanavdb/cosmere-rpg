import { CultureItem } from '@system/documents/item';
import { DeepPartial } from '@system/types/utils';

// Base
import { BaseItemSheet } from './base';

export class CultureItemSheet extends BaseItemSheet {
    static DEFAULT_OPTIONS = {
        classes: ['cosmere-rpg', 'sheet', 'item', 'culture'],
        position: {
            width: 550,
            height: 500,
        },
        form: {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            handler: this.onFormEvent,
            submitOnChange: true,
        },
        window: {
            resizable: true,
            positioned: true,
        },
    };

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            'sheet-content': {
                template:
                    'systems/cosmere-rpg/templates/item/culture/parts/sheet-content.hbs',
            },
        },
    );

    get item(): CultureItem {
        return super.document;
    }

    /* --- Form --- */

    public static onFormEvent(
        this: CultureItemSheet,
        event: Event,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        super.onFormEvent(event, form, formData);
    }

    /* --- Context --- */

    public async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        if (
            this.item.system.description!.value ===
            CONFIG.COSMERE.items.types.culture.desc_placeholder
        ) {
            this.item.system.description!.value = game.i18n!.localize(
                this.item.system.description!.value!,
            );
        }

        const enrichedDescValue = await TextEditor.enrichHTML(
            this.item.system.description!.value!,
        );

        return {
            ...(await super._prepareContext(options)),
            descHtml: enrichedDescValue,
        };
    }
}
