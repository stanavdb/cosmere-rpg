import { AnyObject } from '@system/types/utils';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ReleaseNotesDialog extends HandlebarsApplicationMixin(
    ApplicationV2<AnyObject>,
) {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            window: {
                resizable: true,
            },
            position: {
                width: 800,
            },
            classes: ['cosmere', 'dialog'],
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            content: {
                template: 'systems/cosmere-rpg/release-notes.html',
            },
        },
    );

    private constructor() {
        super({
            window: {
                title: game.i18n!.format('DIALOG.ReleaseNotes.Title', {
                    version: game.system!.version,
                }),
            },
        });
    }

    /* --- Statics --- */

    static async show() {
        await new this().render(true);
    }

    /* --- Lifecycle --- */

    protected _onRender(context: AnyObject, options: AnyObject) {
        super._onRender(context, options);

        $(this.element).attr('open', 'true');
    }

    /* --- Context --- */

    protected _prepareContext() {
        return Promise.resolve({
            version: game.system!.version,
        });
    }
}
