import { DeepPartial, AnyObject } from '@system/types/utils';

// Component System
import ComponentSystem from './system';

// Component
import { HandlebarsApplicationComponent } from './component';

// Types
import { ApplicationV2Constructor, ComponentState } from './types';

const { HandlebarsApplicationMixin } = foundry.applications.api;

export type ComponentHandlebarsRenderOptions =
    foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions & {
        components?: string[];
        componentRefs: string[];
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
        public get components(): Record<
            string,
            HandlebarsApplicationComponent
        > {
            return ComponentSystem.getApplicationComponents(this.id).reduce(
                (dict, component) => ({
                    ...dict,
                    [component.ref]: component,
                }),
                {},
            );
        }

        protected override async _preFirstRender(
            context: RenderContext,
            options: RenderOptions,
        ) {
            await super._preFirstRender(context, options);

            // Register instance
            ComponentSystem.registerApplicationInstance(this);

            // TODO: Add de-register
        }

        protected override _configureRenderOptions(
            options: DeepPartial<RenderOptions>,
        ): void {
            super._configureRenderOptions(options);

            options.componentRefs ??= [];
        }

        protected override async _renderHTML(
            context: RenderContext,
            options: RenderOptions,
        ): Promise<Record<string, HTMLElement>> {
            let renderedParts: Record<string, HTMLElement> = {};
            const renderedComponents: Record<string, HTMLCollection> = {};

            if (options.components) {
                options.componentRefs.push(
                    ...Object.values(this.components)
                        .filter((instance) =>
                            options.components!.includes(instance.selector),
                        )
                        .map((instance) => instance.ref),
                );
            }

            // Part rendering
            if (options.parts?.length > 0) {
                renderedParts = (await super._renderHTML(
                    { ...context, __application: this },
                    options,
                )) as Record<string, HTMLElement>;

                // Get all rendered part ids
                const renderedPartIds = Object.keys(renderedParts);

                // Get all component refs that belong to the rendered parts
                const componentRefs = Object.keys(this.components).filter(
                    (ref) => renderedPartIds.includes(ref.split(':')[1]),
                );

                // Mark components from rendered parts for rendering
                options.componentRefs.push(...componentRefs);
            }

            // Component rendering
            if (options.componentRefs.length > 0) {
                // Sort component refs and filter out duplicates
                options.componentRefs = options.componentRefs
                    .sort()
                    .filter((v, i, self) => self.indexOf(v) === i);

                // Remove all components of which an ancestor is already included in the refs
                for (let i = 0; i < options.componentRefs.length; i++) {
                    const ref = options.componentRefs[i];

                    const numChildren = options.componentRefs
                        .slice(i + 1)
                        .filter((otherRef) => otherRef.startsWith(ref)).length;

                    if (numChildren > 0) {
                        options.componentRefs.splice(i + 1, numChildren);
                    }
                }

                for (const ref of options.componentRefs) {
                    // Perform render
                    const html = await ComponentSystem.renderComponent(
                        ref,
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
            return {
                parts: renderedParts,
                components: renderedComponents,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
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
            let states = {} as Record<string, ComponentState>;

            // Extract existing component states
            Object.keys(components).forEach((ref) => {
                states = {
                    ...states,
                    ...ComponentSystem.getComponentStatesRecursive(ref),
                };
            });

            // Replace parts (if required)
            if (Object.keys(parts).length > 0) {
                super._replaceHTML(parts, content, options);
            }

            // Replace components
            Object.entries(components).forEach(([ref, html]) =>
                ComponentSystem.replaceComponent(ref, html),
            );

            // Apply states
            Object.entries(states).forEach(([ref, state]) =>
                ComponentSystem.applyComponentState(ref, state),
            );

            // Attach listeners
            Object.keys(components).forEach((ref) =>
                ComponentSystem.attachComponentListeners(ref),
            );
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
            // Trigger render events
            options.componentRefs.forEach((ref) =>
                this.dispatchRenderEventRecursive(ref),
            );
        }

        private dispatchRenderEventRecursive(componentRef: string) {
            const component = this.components[componentRef];

            // Dispatch event
            component.dispatchEvent(
                new Event('render', { bubbles: true, cancelable: true }),
            );

            // Recursive call for children
            component.childRefs.forEach((childRef) =>
                this.dispatchRenderEventRecursive(childRef),
            );
        }
    };
}

export type ComponentHandlebarsApplication<
    // NOTE: See above note
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BaseClass extends ApplicationV2Constructor<AnyObject, any, any>,
> = ReturnType<typeof ComponentHandlebarsApplicationMixin<BaseClass>>;
