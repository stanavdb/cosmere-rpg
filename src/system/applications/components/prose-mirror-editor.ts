import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';

// NOTE: Must use type here instead of interface as an interface doesn't match AnyObject type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Params = {
    document: ClientDocument;
    fieldName: string;

    button?: boolean;
    collaborate?: boolean;
    editable?: boolean;
};

export class ProseMirrorEditorComponent extends HandlebarsApplicationComponent<
    ConstructorOf<
        foundry.applications.api.DocumentSheetV2<foundry.abstract.Document.Any>
    >,
    Params
> {
    static readonly TEMPLATE =
        'systems/cosmere-rpg/templates/general/components/prose-mirror-editor.hbs';

    static readonly CLASSES = ['editor', 'prosemirror'];

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static ACTIONS = {
        edit: this.onEdit,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    private instance?: ProseMirrorEditor;
    private active = false;

    /* --- Accessors --- */

    public get editable(): boolean {
        return (this.params!.editable ?? true) && this.application.isEditable;
    }

    /* --- Actions --- */

    private static onEdit(this: ProseMirrorEditorComponent) {
        void this.activate();
    }

    /* --- Public functions --- */

    public async save(options: { remove?: boolean } = {}) {
        const { remove = true } = options;

        // Get content
        const content = ProseMirror.dom.serializeString(
            /**
             * NOTE: Casting to `Node` doesn't work here as prosemirror expects
             * some internal `Node` type.
             */
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.instance!.view.state.doc.content as any,
        );

        // Update content
        await (
            this.params!.document as unknown as foundry.abstract.Document
        ).update({
            [this.params!.fieldName]: content,
        });

        // Close
        if (remove) {
            this.instance!.destroy();
            this.instance = undefined;
            this.active = false;

            // Re-render
            await this.render();
        }
    }

    /* --- Lifecycle --- */

    protected override _onRender(params: Params) {
        if ((!this.params!.button || this.active) && this.editable) {
            this.active = false;
            void this.activate();
        }
    }

    /* --- Context --- */

    public async _prepareContext(params: Params) {
        // Enrich content
        const content = await TextEditor.enrichHTML(
            foundry.utils.getProperty(
                this.params!.document,
                this.params!.fieldName,
            ),
        );

        return {
            button: params.button ?? false,
            editable: this.editable,
            content,
            active: this.active,
        };
    }

    /* --- Helpers --- */

    private async activate() {
        if (this.active) return;
        this.active = true;

        // Enrich content
        const content = await TextEditor.enrichHTML(
            foundry.utils.getProperty(
                this.params!.document,
                this.params!.fieldName,
            ),
        );

        // Hide button
        if (this.params!.button) {
            this.element!.querySelector('a.editor-edit')!.remove();
        }

        // Get element
        const element = this.element!.querySelector('.editor-content')!;

        // Init editor
        this.instance = await ProseMirrorEditor.create(
            element as HTMLElement,
            content,
            {
                document: this.params!.document,
                fieldName: this.params!.fieldName,
                collaborate: this.params!.collaborate ?? false,
                plugins: this.configurePlugin({ remove: this.params!.button }),
            },
        );
    }

    private configurePlugin(options: { remove?: boolean } = {}) {
        const { remove = true } = options;
        return {
            /**
             * NOTE: Must assign to `any` here as Foundry extends the ProseMirror
             * object with `ProseMirrorMenu` and `ProseMirrorKeyMaps` which are not
             * reflected in the types.
             */
            /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
            menu: (ProseMirror as any).ProseMirrorMenu.build(
                ProseMirror.defaultSchema,
                {
                    destroyOnSave: remove,
                    onSave: () => this.save(),
                },
            ),
            keyMaps: (ProseMirror as any).ProseMirrorKeyMaps.build(
                ProseMirror.defaultSchema,
                {
                    onSave: () => this.save(),
                },
            ),
            /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
        };
    }
}

// Register
ProseMirrorEditorComponent.register('app-prose-mirror-editor');
