import { AnyObject, ConstructorOf, DeepPartial } from '@system/types/utils';

// Component imports
import {
    ComponentHandlebarsRenderOptions,
    HandlebarsApplicationComponent,
} from '@system/applications/component-system';
import { AncestrySheet } from '../ancestry-sheet';

// Mixins
import { DragDropComponentMixin } from '@system/applications/mixins/drag-drop';

export class AdvancementTalentListComponent extends DragDropComponentMixin(
    HandlebarsApplicationComponent<ConstructorOf<AncestrySheet>>,
) {
    static TEMPLATE =
        'systems/cosmere-rpg/templates/item/ancestry/components/advancement-talent-list.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static ACTIONS = {
        'remove-talent': this.onRemoveTalent,
        'edit-talent': this.onEditTalent,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    static DRAG_DROP = [
        {
            dropSelector: '*',
        },
    ];

    /* --- Actions --- */

    private static onRemoveTalent(
        this: AdvancementTalentListComponent,
        event: Event,
    ) {
        // Get the element
        const el = $(event.currentTarget!).closest('.talent-ref');

        // Get the index
        const index = Number(el.data('item'));

        // Remove the talent
        void this.application.item.update({
            [`system.advancement.extraTalents.-=${index}`]: null,
        });
    }

    private static onEditTalent(
        this: AdvancementTalentListComponent,
        event: Event,
    ) {
        // Get the element
        const el = $(event.currentTarget!).closest('.talent-ref');

        // Get the index
        const index = Number(el.data('item'));

        this.editTalent(index);
    }

    /* --- Drag drop --- */

    protected override _canDragDrop() {
        return this.application.isEditable;
    }

    protected override _onDragOver(event: DragEvent) {
        if (!this.application.isEditable) return;

        $(this.element!).addClass('dragover');
    }

    protected override async _onDrop(event: DragEvent) {
        if (!this.application.isEditable) return;

        $(this.element!).removeClass('dragover');

        // Get data
        const data = TextEditor.getDragEventData(event) as unknown as {
            type: string;
            uuid: string;
        };

        // Validate type
        if (data.type !== 'Item') {
            return ui.notifications.warn(
                game.i18n!.localize(
                    'COSMERE.Item.Sheet.Ancestry.Component.AdvancementTalentList.Warning.WrongType',
                ),
            );
        }

        // Get the document
        const doc = (await fromUuid(data.uuid)) as unknown as {
            type: string;
        };

        // Ensure the document is a talent
        if (doc.type !== 'talent') {
            return ui.notifications.warn(
                game.i18n!.localize(
                    'COSMERE.Item.Sheet.Ancestry.Component.AdvancementTalentList.Warning.WrongType',
                ),
            );
        }

        // Get the new index
        const newIndex =
            this.application.item.system.advancement.extraTalents.length;

        // Add the talent
        await this.application.item.update({
            [`system.advancement.extraTalents.${newIndex}`]: {
                uuid: data.uuid,
                level: 1,
            },
        });

        setTimeout(() => {
            this.editTalent(newIndex);
        });
    }

    /* --- Lifecycle --- */

    public override _onAttachListeners(params: never) {
        super._onAttachListeners(params);

        $(this.element!).on('dragleave', () => {
            $(this.element!).removeClass('dragover');
        });
    }

    /* --- Context --- */

    public async _prepareContext(
        params: Record<string, unknown>,
        context: AnyObject,
    ) {
        // Get the extra talents from the item
        let { extraTalents } = this.application.item.system.advancement;

        // Process uuids to content links
        extraTalents = await Promise.all(
            extraTalents.map(async (ref) => {
                // Get the document
                const doc = (await fromUuid(
                    ref.uuid,
                )) as unknown as ClientDocument;

                // Generate content link
                const link = new Handlebars.SafeString(
                    doc.toAnchor().outerHTML,
                );

                return {
                    ...ref,
                    link,
                };
            }),
        );

        return {
            ...context,
            extraTalents,
        };
    }

    /* --- Helpers --- */

    protected editTalent(index: number) {
        // Get talent
        const talent =
            this.application.item.system.advancement.extraTalents[index];

        // Find the new element
        const el = $(this.element!).find(`.talent-ref[data-item="${index}"]`);

        // Get the level span
        const level = el.find('.col.level span');

        // Hide the level span
        level.hide();

        // Create the input
        const input = $(
            `<input type="number" value="${talent.level}" min="1">`,
        );

        // Append input
        level.after(input);

        setTimeout(() => {
            // Focus the input
            input.trigger('select');
            input.on('keydown', (event) => {
                if (event.which === 13) {
                    input.trigger('blur');
                }
            });
            input.on('blur', () => {
                // Get the new level
                const newLevel = Number(input.val());

                // Update the item
                if (!isNaN(newLevel) && newLevel !== talent.level) {
                    void this.application.item.update({
                        [`system.advancement.extraTalents.${index}`]: {
                            ...talent,
                            level: newLevel,
                        },
                    });
                } else {
                    // Trigger render
                    void this.render();
                }
            });
        });
    }
}

// Register the component
AdvancementTalentListComponent.register('app-ancestry-advancement-talent-list');
