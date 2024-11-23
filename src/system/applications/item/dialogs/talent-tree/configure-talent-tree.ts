import { TalentTreeItem } from '@system/documents/item';
import { TalentTreeItemData } from '@system/data/item/talent-tree';
import { AnyObject } from '@system/types/utils';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

type DialogData = Pick<TalentTreeItemData, 'width' | 'height'>;

export class ConfigureTalentTreeDialog extends HandlebarsApplicationMixin(
    ApplicationV2<AnyObject>,
) {
    /**
     * NOTE: Unbound methods is the standard for defining actions and forms
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            window: {
                minimizable: false,
                resizable: true,
                positioned: true,
            },
            classes: ['dialog', 'configure-talent-tree'],
            tag: 'dialog',
            position: {
                width: 350,
            },
            actions: {
                update: this.onSubmit,
            },
        },
    );

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            form: {
                template:
                    'systems/cosmere-rpg/templates/item/talent-tree/dialogs/configure.hbs',
                forms: {
                    form: {
                        handler: this.onFormEvent,
                    },
                },
            },
        },
    );
    /* eslint-enable @typescript-eslint/unbound-method */

    private data: DialogData;
    private submitted = false;

    private constructor(
        private item: TalentTreeItem,
        private resolve: (value: boolean) => void,
    ) {
        super({
            window: {
                title: game.i18n!.format('DIALOG.ConfigureTalentTree.Title', {
                    name: item.name,
                }),
            },
        });

        this.data = foundry.utils.deepClone(item.system);
    }

    /* --- Statics --- */

    public static show(item: TalentTreeItem): Promise<boolean> {
        return new Promise((resolve) => {
            void new this(item, resolve).render(true);
        });
    }

    /* --- Form --- */

    protected static onFormEvent(
        this: ConfigureTalentTreeDialog,
        event: Event,
    ) {
        event.preventDefault();
    }

    /* --- Actions --- */

    protected static async onSubmit(this: ConfigureTalentTreeDialog) {
        const form = this.element.querySelector('form')! as HTMLFormElement & {
            width: HTMLInputElement;
            height: HTMLInputElement;
        };

        this.data.width = parseInt(form.width.value, 10);
        this.data.height = parseInt(form.height.value, 10);

        // Ensure the talent tree doesn't have any nodes outside the new bounds
        const nodes = this.item.system.nodes;
        if (
            nodes.some(
                (node) =>
                    node.position.row >= this.data.height ||
                    node.position.column >= this.data.width,
            )
        ) {
            ui.notifications.error(
                game.i18n!.localize(
                    'DIALOG.ConfigureTalentTree.Warning.OutOfBounds',
                ),
            );
        } else {
            // Update the item
            await this.item.update({
                system: this.data,
            });

            this.resolve(true);
            this.submitted = true;
            void this.close();
        }
    }

    /* --- Lifecycle --- */

    protected _onRender(context: AnyObject, options: AnyObject): void {
        super._onRender(context, options);

        $(this.element).prop('open', true);
    }

    protected _onClose() {
        if (!this.submitted) this.resolve(false);
    }

    /* --- Context --- */

    protected _prepareContext() {
        return Promise.resolve({
            ...this.data,
            schema: this.item.system.schema,
        });
    }
}
