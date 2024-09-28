import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { BaseItemSheet, BaseItemSheetRenderContext } from '../base';

const INVALID_CHARS_REGEX = /[^a-z0-9-_]/g;

export class DetailsIdComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseItemSheet>
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/item/components/details-id.hbs';

    /* --- Lifecyle --- */

    protected _onAttachListeners() {
        // Get input element
        const input = this.element!.querySelector('input')!;

        // Add event listeners
        input.addEventListener('change', this.onChange.bind(this));
    }

    private onChange(event: Event) {
        event.preventDefault();

        // Get input
        const input = event.target as HTMLInputElement;

        // Clean value
        const value = input.value
            .trim()
            .toLowerCase()
            .replace(INVALID_CHARS_REGEX, '');

        // Set value
        input.value = value;
    }

    /* --- Context --- */

    public _prepareContext(params: never, context: BaseItemSheetRenderContext) {
        return Promise.resolve({
            ...context,
            hasId: this.application.item.hasId(),
        });
    }
}

// Register the component
DetailsIdComponent.register('app-item-details-id');
