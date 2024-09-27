// import { AnyObject, ConstructorOf } from '@system/types/utils';

// interface EditorOptions {
//     /**
//      * Whether the editor should destroy itself on save.
//      */
//     remove?: boolean | null;
// }

// export function EditorApplicationMixin<
//     BaseClass extends ConstructorOf<
//         // NOTE: Use of any as the mixin doesn't care about the types
//         // and we don't want to interfere with the final type
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         foundry.applications.api.DocumentSheetV2<any, any, any>
//     >,
// >(base: BaseClass) {
//     return class mixin extends base {
//         private editors: Record<string, AnyObject> = {};

//         /* --- Lifecycle --- */

//         // See note above
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         protected _onRender(context: any, options: any): void {
//             super._onRender(context, options);

//             // Activate editors
//             $(this.element)
//                 .find('.editor-content[data-edit]')
//                 .each((_, el) => this._activateEditor(el));
//         }

//         private _activateEditor(el: HTMLElement) {
//             // Get the editor content div
//             const name = el.dataset.edit!;
//             const engine = el.dataset.engine || 'tinymce';
//             const collaborate = el.dataset.collaborate === 'true';
//             const button = el.previousElementSibling;
//             const hasButton = button && button.classList.contains('editor-edit');
//             const wrap = el.parentElement!.parentElement!;
//             const wc = el.closest(".window-content") as HTMLElement;

//             // Determine the preferred editor height
//             const heights = [wrap.offsetHeight, wc ? wc.offsetHeight : null].filter(h => !!h) as number[];
//             if (el.offsetHeight > 0)
//                 heights.push(el.offsetHeight);
//             const height = Math.min(...heights.filter(h => Number.isFinite(h)));

//             // Get initial content
//             const options: Record<string, unknown> = {
//                 target: el,
//                 fieldName: name,
//                 save_onsavecallback: () => this.saveEditor(name),
//                 height,
//                 engine,
//                 collaborate,
//             };
//             if (engine === "prosemirror")
//                 options.plugins = this.configureProseMirrorPlugins(name, { remove: hasButton });

//             // Define the editor configuration
//             const initial = foundry.utils.getProperty(this.document, name);
//             const editor = this.editors[name] = {
//                 options,
//                 target: name,
//                 button: button,
//                 hasButton: hasButton,
//                 mce: null,
//                 instance: null,
//                 active: !hasButton,
//                 changed: false,
//                 initial
//             };

//             // Activate the editor immediately, or upon button click
//             const activate = () => {
//                 editor.initial = foundry.utils.getProperty(this.document, name);
//                 this.activateEditor(name, {}, editor.initial);
//             };
//             if (hasButton) (button as HTMLButtonElement).onclick = activate;
//             else activate();
//         }

//         /**
//          * Configure ProseMirror plugins for this sheet.
//          * @param name      The name of the editor.
//          * @param options   Additional options to configure the plugins.
//          */
//         private configureProseMirrorPlugins(name: string, options: EditorOptions = {}) {
//             const { remove = true } = options;

//             return {
//                 menu: (ProseMirror as any).ProseMirrorMenu.build(ProseMirror.defaultSchema, {
//                     destroyOnSave: remove,
//                     onSave: () => this.saveEditor(name, { remove })
//                 }),
//                 keyMaps: (ProseMirror as any).ProseMirrorKeyMaps.build(ProseMirror.defaultSchema, {
//                     onSave: () => this.saveEditor(name, { remove })
//                 })
//             };
//         }

//         public async saveEditor(name: string, options: EditorOptions = {}) {
//             // TODO
//         }

//         public async activateEditor(name: string, options: object, initialContent: string = '') {
//             const editor = this.editors[name];
//             if (!editor) throw new Error(`${name} is not a registered editor name!`);
//             options = foundry.utils.mergeObject(editor.options, options);
//             if (!options.fitToSize) options.height = options.target.offsetHeight;
//             if (editor.hasButton) editor.button.style.display = "none";
//             const instance = editor.instance = editor.mce = await TextEditor.create(options, initialContent || editor.initial);
//             options.target.closest(".editor")?.classList.add(options.engine ?? "tinymce");
//             editor.changed = false;
//             editor.active = true;

//             // Legacy behavior to support TinyMCE.
//             if (options.engine !== "prosemirror") {
//                 instance.focus();
//                 instance.on("change", () => editor.changed = true);
//             }
//             return instance;
//         }
//     }
// }
