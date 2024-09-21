import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '../../mixins/component-handlebars-application-mixin';
import { BaseActorSheet } from '../base';

export interface SearchBarInputEventDetail {
    text: string;
    sort: SortDirection;
}

export type SearchBarInputEvent = CustomEvent<SearchBarInputEventDetail>;

export const enum SortDirection {
    Ascending = 'asc',
    Descending = 'desc',
}

// NOTE: Must use type here instead of interface as an interface doesn't match AnyObject type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Params = {
    placeholder?: string;
};

export class ActorSearchBarComponent extends HandlebarsApplicationComponent<
    ConstructorOf<BaseActorSheet>,
    Params
> {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/actors/components/search-bar.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static readonly ACTIONS = {
        'clear-actions-search': this.onClearActionsSearch,
        'toggle-actions-search-sort-direction': this.onToggleActionsSearchSort,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    private searchText = '';
    private sortDirection: SortDirection = SortDirection.Descending;

    /* --- Actions --- */

    public static onClearActionsSearch(this: ActorSearchBarComponent) {
        this.searchText = '';

        void this.render();
        this.triggerChange();
    }

    public static onToggleActionsSearchSort(this: ActorSearchBarComponent) {
        this.sortDirection =
            this.sortDirection === SortDirection.Ascending
                ? SortDirection.Descending
                : SortDirection.Ascending;

        void this.render();
        this.triggerChange();
    }

    /* --- Life cycle --- */

    public _onAttachListeners(): void {
        $(this.element)
            .find('input')
            .on('input', this.onActionsSearchChange.bind(this));
    }

    /* --- Event handlers --- */

    private onActionsSearchChange(event: Event) {
        if (event.type !== 'input') return;
        event.preventDefault();
        event.stopPropagation();

        this.searchText = (
            event.target as HTMLInputElement
        ).value.toLowerCase();
        this.triggerChange();
    }

    private triggerChange() {
        const event = new CustomEvent('search', {
            detail: {
                text: this.searchText,
                sort: this.sortDirection,
            },
        });

        this.element.dispatchEvent(event);
    }

    /* --- Context --- */

    public _prepareContext(params: Params) {
        return Promise.resolve({
            text: this.searchText,
            sort: this.sortDirection,
            placeholder: params.placeholder,
        });
    }
}
