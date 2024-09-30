import { ConstructorOf, AnyObject } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';

// NOTE: Must use type here instead of interface as an interface doesn't match AnyObject type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Params = {
    value: string;
    name: string;
    editable?: boolean;
    placeholder?: string;
};

// Constants
const INVALID_CHARS_REGEX = /[^a-z0-9-_\s]/g;

export class IdInputComponent extends HandlebarsApplicationComponent<
    ConstructorOf<foundry.applications.api.ApplicationV2>,
    Params
> {
    static readonly TEMPLATE =
        'systems/cosmere-rpg/templates/general/components/id-input.hbs';

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
            .replace(INVALID_CHARS_REGEX, '')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .join('-');

        // Set value
        input.value = value;
    }

    /* --- Context --- */

    public _prepareContext(params: Params, context: AnyObject) {
        return Promise.resolve({
            ...context,
            ...params,
        });
    }
}

// Register the component
IdInputComponent.register('app-id-input');
