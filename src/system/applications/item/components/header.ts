import { CosmereItem } from '@system/documents/item';
import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseItemSheet, BaseItemSheetRenderContext } from '../base';

export class ItemHeaderComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseItemSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/item/components/header.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static ACTIONS = {
        'edit-name': this.onEditName,
        'edit-img': this.onEditImg,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    /* --- Actions --- */

    private static onEditName(this: ItemHeaderComponent) {
        // Hide name span
        $(this.element!).find('.document-name span').hide();

        // Find input element
        const input = $(this.element!).find('.document-name input');

        // Check if input has focus
        if (input.is(':focus')) return;

        // Show input element
        input.show();

        setTimeout(() => {
            // Select the text
            input.trigger('select');

            // Add blur handler
            input.on('blur', () => {
                // Remove handler
                input.off('blur');

                // Hide input element
                input.hide();

                // Show name span
                $(this.element!).find('.document-name span').show();
            });
        });
    }

    private static onEditImg(this: ItemHeaderComponent) {
        if (!this.application.isEditable) return;

        const { img: defaultImg } = CosmereItem.getDefaultArtwork(
            this.application.item.toObject(),
        );

        void new FilePicker({
            current: this.application.item.img,
            type: 'image',
            redirectToRoot: [defaultImg],
            top: this.application.position.top + 40,
            left: this.application.position.left + 10,
            callback: (path) => {
                void this.application.item.update({
                    img: path,
                });
            },
        }).browse();
    }

    /* --- Context --- */

    public _prepareContext(params: never, context: BaseItemSheetRenderContext) {
        return Promise.resolve({
            ...context,

            typeLabel:
                CONFIG.COSMERE.items.types[this.application.item.type].label,
        });
    }
}

// Register the component
ItemHeaderComponent.register('app-item-header');
