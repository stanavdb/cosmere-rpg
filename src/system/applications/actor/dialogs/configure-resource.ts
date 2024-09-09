import { Resource } from '@system/types/cosmere';
import { CosmereActor } from '@system/documents';

// Constants
const CONFIGURE_RESOURCE_TEMPLATE =
    'systems/cosmere-rpg/templates/actors/character/dialogs/edit-resource.hbs';

type ResourceMode = 'derived' | 'override';

export class ConfigureResourceDialog extends foundry.applications.api.DialogV2 {
    private constructor(
        private resourceId: Resource,
        private actor: CosmereActor,
        content: string,
    ) {
        // Get resource config
        const config = CONFIG.COSMERE.resources[resourceId];

        // Init
        super({
            window: {
                title: game
                    .i18n!.localize('DIALOG.EditResource.Title')
                    .replace('[resource]', game.i18n!.localize(config.label)),
                minimizable: false,
                positioned: true,
            },
            position: {
                width: 400,
            },
            content,
            buttons: [
                {
                    label: 'GENERIC.Button.Save',
                    action: 'save',
                },
                {
                    label: 'GENERIC.Button.Cancel',
                    action: 'cancel',
                },
            ],
        });
    }

    /* --- Statics --- */

    public static async show(
        resourceId: Resource,
        actor: CosmereActor,
    ): Promise<void> {
        // Get the resource
        const resource = actor.system.resources[resourceId];

        // Get resource config
        const config = CONFIG.COSMERE.resources[resourceId];

        // Render dialog inner HTML
        const content = await renderTemplate(CONFIGURE_RESOURCE_TEMPLATE, {
            mode: resource.max.useOverride ? 'override' : 'derived',
            modes: {
                derived: 'DIALOG.EditResource.Mode.Derived',
                override: 'DIALOG.EditResource.Mode.Override',
            },
            value: resource.max,
            formula: config.formula ?? '',
        });

        await new ConfigureResourceDialog(resourceId, actor, content).render(
            true,
        );
    }

    /* --- Actions --- */

    private onSave(this: ConfigureResourceDialog) {
        const form = this.element.querySelector('form')! as HTMLFormElement & {
            value: HTMLInputElement;
            resourceMode: HTMLSelectElement;
        };

        const mode = form.resourceMode.value as ResourceMode;

        if (mode === 'derived') {
            void this.actor.update({
                [`system.resources.${this.resourceId}.max.useOverride`]: false,
            });
        } else {
            // Get value
            const value = Number(form.value.value);
            if (isNaN(value)) return;

            void this.actor.update({
                [`system.resources.${this.resourceId}.max`]: {
                    useOverride: true,
                    override: value,
                },
            });
        }
    }

    /* --- Lifecycle --- */

    protected _onSubmit(
        target: HTMLButtonElement,
        event: PointerEvent | SubmitEvent,
    ): Promise<foundry.applications.api.DialogV2> {
        const result = super._onSubmit(target, event);

        if (!target || target.dataset.action === 'save') {
            this.onSave();
        }

        return result;
    }

    protected _onRender() {
        // Get the resource
        const resource = this.actor.system.resources[this.resourceId];

        // Get resource config
        const config = CONFIG.COSMERE.resources[this.resourceId];

        // Event handlers for resource mode selection
        $(this.element)
            .find('select[name="resourceMode"]')
            .on('change', (event) => {
                // Get mode
                const mode = $(event.target).val() as ResourceMode;

                if (mode === 'derived') {
                    $(this.element).find('input[name="value"]').replaceWith(`
                            <input type="text" name="value" value="${config.formula}" readonly>
                        `);
                } else {
                    $(this.element).find('input[name="value"]').replaceWith(`
                            <input type="number" min="0" step="1" name="value" value="${resource.max.override ?? resource.max.value}">
                        `);
                }
            });
    }
}
