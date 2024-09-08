import { DeepPartial, AnyObject } from '@system/types/utils';
import { ApplicationV2Constructor } from './types';

const { HandlebarsApplicationMixin } = foundry.applications.api;

export type ComponentHandlebarsRenderOptions =
    foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions & {
        componentRefs: string[];
    };

export class HandlebarsApplicationComponent<
    BaseClass extends ApplicationV2Constructor<
        AnyObject,
        foundry.applications.api.ApplicationV2.Configuration,
        foundry.applications.api.ApplicationV2.RenderOptions
    > = ApplicationV2Constructor<
        AnyObject,
        foundry.applications.api.ApplicationV2.Configuration,
        foundry.applications.api.ApplicationV2.RenderOptions
    >,
    Params extends AnyObject = AnyObject,
    out RenderContext extends
        AnyObject = BaseClass extends ApplicationV2Constructor<infer R>
        ? R
        : never,
> extends foundry.utils.EventEmitterMixin(Object) {
    static emittedEvents = ['render'];

    /**
     * The template entry-point for the Component
     */
    public static readonly TEMPLATE: string = '[invalid]';

    /**
     * An array of CSS classes to apply to the top-level element of the
     * rendered component.
     */
    public static readonly CLASSES: string[] = [];

    /**
     * An array of templates that are required to render the component.
     * If omitted, only the entry-point is inferred as required.
     */
    public static readonly TEMPLATES?: string[];

    /**
     * An array of selectors within this component whose scroll positions should
     * be persisted during a re-render operation. A blank string is used
     * to denote that the root level of the component is scrollable.
     */
    public static readonly SCROLLABLE: string[] = [];

    /**
     * A registry of forms selectors and submission handlers.
     */
    public static readonly FORMS: Record<
        string,
        foundry.applications.api.ApplicationV2.FormConfiguration
    > = {};

    /**
     * Click actions supported by this Component and their event handler functions.
     * A handler function can be defined directly which only
     * responds to left-click events. Otherwise, an object can be declared
     * containing both a handler function and an array of buttons which are
     * matched against the PointerEvent#button property.
     */
    public static readonly ACTIONS: foundry.applications.api.ApplicationV2.Configuration['actions'] =
        {};

    constructor(
        public readonly id: string,
        public readonly selector: string,
        public readonly partId: string,
        public readonly ref: string,
        public readonly application: InstanceType<
            ReturnType<typeof ComponentHandlebarsApplicationMixin<BaseClass>>
        >,
    ) {
        super();
    }

    public get element(): HTMLElement {
        return this.application.components[this.ref].element;
    }

    /* --- Rendering --- */

    /**
     * Render this component
     */
    protected async render() {
        await this.application.render({
            parts: [],
            componentRefs: [this.ref],
        });

        return this;
    }

    /* --- Context --- */

    /**
     * Prepare Component rendering context data for a given render request.
     * @param params    - The params passed to the Component from the part
     * @param context   - The parts render context
     * @param options   - Options which configure rendering behavior
     * @returns         Context data for the rendering operation
     * @virtual
     */
    public _prepareContext(
        params: Params,
        context: RenderContext,

        // NOTE: Available to be used by child classes
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        options: DeepPartial<ComponentHandlebarsRenderOptions>,
    ): Promise<AnyObject> {
        return Promise.resolve(context);
    }

    /* --- Lifecycle --- */

    /**
     * Actions performed after Component initialization.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    public _onInitialize(params: Params) {}

    /**
     * Actions performed after Component listeners are attached.
     * Use this to attach your own event listeners.
     * @param params
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    public _onAttachListeners(params: Params) {}
}

interface ComponentState {
    scrollPositions: [
        target: HTMLElement | null,
        scrollTop: number,
        scrollLeft: number,
    ][];
    focus?: string;
}

type ComponentActionHandler =
    | foundry.applications.api.ApplicationV2.ClickAction
    | {
          handler: foundry.applications.api.ApplicationV2.ClickAction;
          buttons: number[];
      };

type RenderContext = AnyObject;
type RenderOptions = ComponentHandlebarsRenderOptions & AnyObject;

export function ComponentHandlebarsApplicationMixin<
    /**
     * NOTE: ApplicationV2 types appear to be wrong in places
     * and won't play nice in this use case.
     * Have resorted to `any` type as a way around the problems.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BaseClass extends ApplicationV2Constructor<AnyObject, any, any>,
>(base: BaseClass) {
    return class mixin extends HandlebarsApplicationMixin(base) {
        /**
         * Configure a registry of components which are supported for this application for partial rendering and re-use
         * @default `{}`
         */
        static COMPONENTS: Record<
            string,
            typeof HandlebarsApplicationComponent
        > = {};

        private _components: Record<
            string,
            {
                instance: HandlebarsApplicationComponent;
                element: HTMLElement;
            }
        > = {};

        public get components(): Record<
            string,
            {
                instance: HandlebarsApplicationComponent;
                element: HTMLElement;
            }
        > {
            return this._components;
        }

        protected override _configureRenderOptions(
            options: DeepPartial<RenderOptions>,
        ): void {
            super._configureRenderOptions(options);

            options.componentRefs ??= Object.keys(this._components);
        }

        protected override async _preFirstRender(
            context: RenderContext,
            options: RenderOptions,
        ) {
            await super._preFirstRender(context, options);

            // Load component templates
            const allTemplates = new Set<string>();
            Object.values(mixin.COMPONENTS).forEach((componentCls) => {
                const componentTemplates = [
                    componentCls.TEMPLATE,
                    ...(componentCls.TEMPLATES ?? []),
                ];
                componentTemplates.forEach((t) => allTemplates.add(t));
            });
            await loadTemplates(Array.from(allTemplates));
        }

        protected override async _renderHTML(
            context: RenderContext,
            options: RenderOptions,
        ): Promise<Record<string, HTMLElement>> {
            let renderedParts: Record<string, HTMLElement> = {};
            const renderedComponents: Record<string, HTMLCollection> = {};

            // Part rendering
            if (options.parts?.length > 0) {
                renderedParts = (await super._renderHTML(
                    context,
                    options,
                )) as Record<string, HTMLElement>;

                // Mark all components in rendered parts for rendering
                Object.entries(renderedParts).forEach(
                    ([partId, partElement]) => {
                        Object.entries(mixin.COMPONENTS).forEach(
                            ([selector, componentCls]) => {
                                // Find all elements that should contain the component
                                const componentElements = $(partElement)
                                    .find(selector)
                                    .toArray();

                                componentElements.forEach(
                                    (componentElement, i) => {
                                        // Assign id
                                        const id = i.toFixed();

                                        // Construct ref
                                        const ref = `${partId}.${selector}.${id}`;

                                        // Instantiate component class if no instance exists
                                        if (!this._components[ref]) {
                                            this._components[ref] = {
                                                instance: new componentCls(
                                                    id,
                                                    selector,
                                                    partId,
                                                    ref,
                                                    this,
                                                ),
                                                element: componentElement,
                                            };

                                            // Invoke lifecycle event
                                            const params =
                                                this.getComponentParams(
                                                    componentElement,
                                                );
                                            this._components[
                                                ref
                                            ].instance._onInitialize(params);
                                        } else {
                                            this._components[ref].element =
                                                componentElement;
                                        }

                                        // Assign data attribute
                                        $(componentElement).attr(
                                            'data-application-component-id',
                                            id,
                                        );

                                        // Apply classes
                                        componentCls.CLASSES.forEach((cssCls) =>
                                            $(componentElement).addClass(
                                                cssCls,
                                            ),
                                        );

                                        // Mark component for rendering
                                        options.componentRefs.push(ref);
                                    },
                                );
                            },
                        );
                    },
                );
            }

            // Component rendering
            if (options.componentRefs.length > 0) {
                for (const ref of options.componentRefs) {
                    // Get component instance and element
                    const { element: componentElement } = this._components[ref];

                    // Perform render
                    const html = await this.renderComponent(
                        ref,
                        componentElement,
                        context,
                        options,
                    );

                    // Add component to list of rendered components
                    renderedComponents[ref] = html;
                }
            }

            /**
             * NOTE: Changing the return type of this function is actually
             * within spec for ApplicationV2 (so long as the return type of
             * _renderHTML and the result param of _replaceHTML match).
             * However the types on HandlebarsApplication don't allow it without
             * casting to any.
             */
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return {
                parts: renderedParts,
                components: renderedComponents,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
        }

        private async renderComponent(
            ref: string,
            componentElement: HTMLElement,
            context: RenderContext,
            options: RenderOptions,
        ) {
            // Get the instance
            const { instance } = this._components[ref];

            const params = this.getComponentParams(componentElement);

            // Prepare component context
            const componentContext = await instance._prepareContext(
                params,
                context,
                options,
            );

            // Get selector from ref
            const selector = ref.split('.')[1];

            try {
                const htmlString = await renderTemplate(
                    mixin.COMPONENTS[selector].TEMPLATE,
                    componentContext,
                );
                const t = document.createElement('template');
                t.innerHTML = htmlString;
                return t.content.children;
            } catch (err) {
                throw new Error(
                    `Failed to render component template "${selector}":\n${(err as Error).message}`,
                    { cause: err },
                );
            }
        }

        protected override _replaceHTML(
            result: AnyObject,
            content: HTMLElement,
            options: RenderOptions,
        ): void {
            const parts = result.parts as Record<string, HTMLElement>;
            const components = result.components as Record<
                string,
                HTMLCollection
            >;
            const states = {} as Record<string, ComponentState>;

            // Extract existing component states
            Object.keys(components).forEach((ref) => {
                // Split ref
                const [partId, selector, id] = ref.split('.');

                // Find the existing element
                const priorElement = content.querySelector(
                    `[data-application-part="${partId}"] ${selector}[data-application-component-id="${id}"]`,
                ) as HTMLElement | undefined;

                if (!priorElement) return;

                // Extract component state
                states[ref] = this.getComponentState(
                    selector,
                    components[ref],
                    priorElement,
                );
            });

            // Replace parts (if required)
            if (Object.keys(parts).length > 0) {
                super._replaceHTML(parts, content, options);
            }

            // Replace components
            Object.keys(components).forEach((ref) => {
                // Split ref
                const [partId, selector, id] = ref.split('.');

                // Get rendered content
                const componentContent = components[ref];

                // Find the existing element
                const priorElement: HTMLElement = content.querySelector(
                    `[data-application-part="${partId}"] ${selector}[data-application-component-id="${id}"]`,
                )!;

                // Replace content
                $(priorElement).empty();
                $(priorElement).append($(componentContent));

                // Apply state
                if (states[ref])
                    this.applyComponentState(priorElement, states[ref]);

                // Get the instance
                const { instance } = this._components[ref];

                // Attach listeners
                this.attachComponentListeners(instance, selector, priorElement);

                // Get params
                const params = this.getComponentParams(priorElement);

                // Invoke lifecycle
                instance._onAttachListeners(params);
            });
        }

        protected override async _prepareContext(
            options: DeepPartial<RenderOptions>,
        ): Promise<RenderContext> {
            return await super._prepareContext(options);
        }

        protected override _onRender(
            context: RenderContext,
            options: RenderOptions,
        ): void {
            // Get components
            const renderedComponents = options.componentRefs.map(
                (ref) => this.components[ref],
            );

            // Trigger render event
            renderedComponents.forEach((component) =>
                component.instance.dispatchEvent(
                    new Event('render', { bubbles: true, cancelable: true }),
                ),
            );
        }

        /**
         * Utility function to extract the state of a component
         */
        private getComponentState(
            selector: string,
            newContent: HTMLCollection,
            priorElement: HTMLElement,
        ) {
            // Get the component class (for config)
            const componentCls = mixin.COMPONENTS[selector];

            // Prepare return state
            const state = {} as Partial<ComponentState>;

            // Focused element or field
            const focus: HTMLElement | null =
                priorElement.querySelector(':focus');
            if (focus?.id) state.focus = `#${focus.id}`;
            else if (focus && focus instanceof HTMLInputElement)
                state.focus = `${focus.tagName}[name="${focus.name}"]`;

            // Scroll positions
            state.scrollPositions = [];
            componentCls.SCROLLABLE.forEach((scrollSelector) => {
                const priorScrollElement =
                    scrollSelector === ''
                        ? priorElement
                        : priorElement.querySelector(scrollSelector);

                if (priorScrollElement) {
                    const newScrollElement =
                        scrollSelector === ''
                            ? null
                            : $(newContent)
                                  .find(scrollSelector)
                                  .get()
                                  .find(() => true);

                    if (newScrollElement !== undefined) {
                        state.scrollPositions!.push([
                            newScrollElement,
                            priorScrollElement.scrollTop,
                            priorScrollElement.scrollLeft,
                        ]);
                    }
                }
            });

            return state as ComponentState;
        }

        /**
         * Utility function to apply the component state
         */
        private applyComponentState(
            componentElement: HTMLElement,
            state: ComponentState,
        ) {
            if (state.focus) {
                const el = componentElement.querySelector(state.focus) as
                    | HTMLElement
                    | undefined;
                el?.focus();
            }

            state.scrollPositions.forEach(([target, scrollTop, scrollLeft]) => {
                target ??= componentElement;

                Object.assign(target, { scrollTop, scrollLeft });
            });
        }

        private getComponentParams(componentElement: HTMLElement): AnyObject {
            // Get param attributes
            const paramAttrs = Array.from(componentElement.attributes)
                .filter((attr) => attr.name.startsWith('param-'))
                .reduce(
                    (paramAttrs, attr) => {
                        return {
                            ...paramAttrs,
                            [attr.name.replace('param-', '')]: attr.value,
                        };
                    },
                    {} as Record<string, string>,
                );

            // Get params
            const params = Object.entries(paramAttrs)
                .filter(([key]) => !key.endsWith('__type'))
                .reduce(
                    (params, [key, value]) => {
                        // Get data type
                        const type = paramAttrs[`${key}__type`];

                        // Parse value
                        const parsed =
                            type === 'string'
                                ? value
                                : type === 'number'
                                  ? Number(value)
                                  : type === 'boolean'
                                    ? Boolean(value)
                                    : type === 'Object'
                                      ? (JSON.parse(value) as object)
                                      : undefined;

                        return {
                            ...params,
                            [key]: parsed,
                        };
                    },
                    {} as Record<
                        string,
                        string | number | boolean | object | undefined
                    >,
                );

            return params;
        }

        private attachComponentListeners(
            instance: HandlebarsApplicationComponent,
            componentSelector: string,
            htmlElement: HTMLElement,
        ) {
            // Get the component actions
            const actions = mixin.COMPONENTS[componentSelector].ACTIONS;

            Object.entries(actions).forEach(([actionId, handler]) => {
                // Construct selector
                const actionSelector = `[data-action="${actionId}"]`;

                // Find the action elements
                const actionElements = htmlElement.matches(actionSelector)
                    ? $(htmlElement)
                    : $(htmlElement).find(actionSelector);

                // Add listeners
                actionElements.get().forEach((el) => {
                    el.addEventListener(
                        'click',
                        this.onComponentAction.bind(this, instance, handler),
                    );
                    el.addEventListener(
                        'contextmenu',
                        this.onComponentAction.bind(this, instance, handler),
                    );
                });
            });
        }

        private onComponentAction(
            instance: HandlebarsApplicationComponent,
            handler: ComponentActionHandler,
            event: MouseEvent,
        ) {
            if (!(event instanceof PointerEvent)) return;
            if (!(event.target instanceof HTMLElement)) return;

            let buttons = [0];
            if (typeof handler === 'object') {
                buttons = handler.buttons;
                handler = handler.handler;
            }

            if (buttons.includes(event.button))
                void handler.call(instance, event, event.target);
        }
    };
}

export type ComponentHandlebarsApplication<
    // NOTE: See above note
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BaseClass extends ApplicationV2Constructor<AnyObject, any, any>,
> = ReturnType<typeof ComponentHandlebarsApplicationMixin<BaseClass>>;
