import { ConstructorOf } from '@system/types/utils';

interface DragDropConfiguration {
    dragDrop: Omit<DragDropConfiguration, 'permissions' | 'callbacks'>[];
}

export function DragDropApplicationMixin<
    Config extends foundry.applications.api.ApplicationV2.Configuration &
        DragDropConfiguration,
    // NOTE: Use of any as the mixin doesn't care about the types
    // and we don't want to interfere with the final type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BaseClass extends ConstructorOf<
        foundry.applications.api.ApplicationV2<any, Config, any>
    >,
>(base: BaseClass) {
    return class mixin extends base {
        private _dragDrop: DragDrop[];

        // NOTE: Must use any to comply with mixin constructor signature
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
            super(...args);

            this._dragDrop = this.createDragDropHandlers();
        }

        private createDragDropHandlers(): DragDrop[] {
            return (this.options.dragDrop ?? []).map(
                (d) =>
                    new DragDrop({
                        ...d,
                        permissions: {
                            dragstart: this._canDragStart.bind(this),
                            drop: this._canDragDrop.bind(this),
                        },
                        callbacks: {
                            dragstart: this._onDragStart.bind(this),
                            dragover: this._onDragOver.bind(this),
                            drop: this._onDrop.bind(this),
                        },
                    }),
            );
        }

        /* --- Accessors --- */

        public get dragDrop() {
            return this._dragDrop;
        }

        /* --- Lifecycle --- */

        // See note above
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        protected _onRender(context: any, options: any): void {
            super._onRender(context, options);

            // Bind handlers
            this._dragDrop.forEach((d) => d.bind(this.element));
        }

        /* --- Functions --- */

        protected _canDragStart(selector?: string | null): boolean {
            return false;
        }

        protected _canDragDrop(selector?: string | null): boolean {
            return false;
        }

        protected _onDragStart(event: DragEvent) {}

        protected _onDragOver(event: DragEvent) {}

        protected _onDrop(event: DragEvent) {}
    };
}
