export namespace AppContextMenu {
    export interface Item {
        name: string;
        icon: string;
        classes?: string[];
        callback?: (element: HTMLElement) => void;
    }

    export interface Parent {
        element: HTMLElement;
        addEventListener: (
            event: string,
            handler: (...args: unknown[]) => void,
        ) => void;
    }

    export type Anchor = 'left' | 'right';
}

// Constants
const TEMPLATE = '/systems/cosmere-rpg/templates/general/context-menu.hbs';

export class AppContextMenu {
    /**
     * The root element of the context menu.
     */
    private element?: HTMLElement;

    /**
     * The element that was clicked to open the context menu.
     */
    private contextElement?: HTMLElement;
    private expanded = false;
    private bound = false;

    public constructor(
        private parent: AppContextMenu.Parent,
        private anchor: AppContextMenu.Anchor,
        private items: AppContextMenu.Item[],
    ) {
        void this.render();
    }

    /**
     * Utility function to create a context menu
     * and automatically bind it to the elements
     * matching the selectors.
     *
     * This function takes care of re-binding on render.
     */
    public static create(
        parent: AppContextMenu.Parent,
        anchor: AppContextMenu.Anchor,
        items: AppContextMenu.Item[],
        ...selectors: string[]
    ): AppContextMenu {
        // Create context menu
        const menu = new AppContextMenu(parent, anchor, items);

        // Add event listener
        parent.addEventListener('render', async () => {
            await menu.render();
            menu.bind(...selectors);
        });

        return menu;
    }

    public bind(...selectors: string[]): void;
    public bind(...elements: HTMLElement[]): void;
    public bind(...params: string[] | HTMLElement[]): void {
        if (this.bound) return;
        if (params.length === 0) return;

        const elements: HTMLElement[] = [];
        if (typeof params[0] === 'string') {
            elements.push(
                ...params
                    .map((selector) =>
                        $(this.parent.element).find(selector).toArray(),
                    )
                    .flat(),
            );
        } else {
            elements.push(...(params as HTMLElement[]));
        }

        // Attach listeners
        elements.forEach((element) => {
            element.addEventListener('click', () => {
                const shouldShow =
                    !this.expanded || this.contextElement !== element;

                if (this.expanded) this.hide();

                if (shouldShow) {
                    setTimeout(() => {
                        this.show(element);
                    });
                }
            });
        });

        // Set as bound
        this.bound = true;
    }

    private show(element: HTMLElement) {
        // Set the context element
        this.contextElement = element;

        // Get element bounds
        const elementBounds = element.getBoundingClientRect();
        const rootBounds = this.parent.element.getBoundingClientRect();

        // Figure out positioning with anchor
        const positioning = {
            top: elementBounds.bottom - rootBounds.top,

            ...(this.anchor === 'right'
                ? {
                      right: rootBounds.right - elementBounds.right,
                  }
                : {
                      left: elementBounds.left - rootBounds.left,
                  }),
        };

        // Set positioning
        $(this.element!).css('top', `${positioning.top}px`);
        if ('right' in positioning)
            $(this.element!).css('right', `${positioning.right}px`);
        else $(this.element!).css('left', `${positioning.left}px`);

        // Remove hidden
        $(this.element!).addClass('expanded');
        $(this.element!).removeClass('hidden');

        // Set expanded
        this.expanded = true;
    }

    private hide() {
        // Hide
        $(this.element!).removeClass('expanded');
        $(this.element!).addClass('hidden');

        // Clear context
        this.contextElement = undefined;

        // Unset expanded
        this.expanded = false;
    }

    public async render(): Promise<void> {
        // Render the element
        this.element = await this.renderElement();

        // Add hidden class
        $(this.element).addClass('hidden');

        // Attach listeners
        $(this.element)
            .find('button[data-item]')
            .on('click', (event) => {
                // Get the index
                const index = Number(
                    $(event.target).closest('button[data-item]').data('item'),
                );

                // Get the item
                const item = this.items[index];

                // Trigger the callback
                if (item.callback) item.callback(this.contextElement!);

                // Hide the context menu
                this.hide();
            });

        // Add element to parent
        this.parent.element.appendChild(this.element);

        // Set as not bound
        this.bound = false;
    }

    private async renderElement(): Promise<HTMLElement> {
        const htmlStr = await renderTemplate(TEMPLATE, {
            items: this.items.map((item) => ({
                ...item,
                cssClasses: item.classes?.join(' ') ?? '',
            })),
        });
        const t = document.createElement('template');
        t.innerHTML = htmlStr;
        return t.content.children[0] as HTMLElement;
    }
}
