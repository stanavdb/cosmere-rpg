import { Talent } from '@system/types/item';
import { CosmereItem, TalentItem } from '@system/documents/item';
import { ConstructorOf } from '@system/types/utils';

// Component imports
import { HandlebarsApplicationComponent } from '@system/applications/component-system';
import { EditTalentPrerequisiteDialog } from '../dialogs/edit-talent-prerequisite';

// Mixins
import { DragDropComponentMixin } from '@system/applications/mixins/drag-drop';

// NOTE: Must use type here instead of interface as an interface doesn't match AnyObject type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Params = {
    rootTalent: TalentItem;
    talents: Talent.Prerequisite.TalentRef[];
    mode: Talent.Prerequisite.Mode;
};

export class TalentPrerequisiteTalentListComponent extends DragDropComponentMixin(
    HandlebarsApplicationComponent<
        ConstructorOf<EditTalentPrerequisiteDialog>,
        Params
    >,
) {
    static readonly TEMPLATE =
        'systems/cosmere-rpg/templates/item/talent/components/prerequisite-talent-list.hbs';

    /**
     * NOTE: Unbound methods is the standard for defining actions
     * within ApplicationV2
     */
    /* eslint-disable @typescript-eslint/unbound-method */
    static ACTIONS = {
        'remove-talent': this.onRemoveTalent,
    };
    /* eslint-enable @typescript-eslint/unbound-method */

    static DRAG_DROP = [
        {
            dropSelector: '*',
        },
    ];

    /* --- Actions --- */

    private static onRemoveTalent(
        this: TalentPrerequisiteTalentListComponent,
        event: Event,
    ) {
        // Get talent element
        const el = $(event.currentTarget!).closest('.talent');

        // Get index
        const index = el.data('item') as number;

        // Remove talent
        this.params!.talents.splice(index, 1);

        // Dispatch change event
        this.element!.dispatchEvent(new Event('change'));
    }

    /* --- Drag drop --- */

    protected override _canDragDrop() {
        return true;
    }

    protected override async _onDrop(event: DragEvent) {
        const data = TextEditor.getDragEventData(event) as unknown as {
            type: string;
            uuid: string;
        };

        if (data.type !== 'Item') return;

        // Get document
        const item = (await fromUuid(data.uuid))! as unknown as CosmereItem;

        // Check if document is a talent
        if (!item.isTalent()) return;

        // Check if the talent is the same as the root talent
        if (item.system.id === this.params!.rootTalent.system.id) {
            return ui.notifications.warn(
                game.i18n!.localize(
                    'GENERIC.Warning.TalentCannotBePrerequisiteOfItself',
                ),
            );
        }

        // Check if a talent with the same ID is already in the list
        const duplicateRef = this.params!.talents.find(
            (ref) => ref.id === item.system.id,
        );
        if (duplicateRef) {
            // Retrieve duplicate talent
            const duplicate = (await fromUuid(
                duplicateRef.uuid,
            ))! as unknown as TalentItem;

            // Show a warning
            return ui.notifications.warn(
                game.i18n!.format(
                    'GENERIC.Warning.DuplicatePrerequisiteTalentRef',
                    {
                        talentId: duplicate.system.id,
                        talentName: duplicate.name,
                    },
                ),
            );
        }

        // Add talent to the list
        this.params!.talents.push({
            id: item.system.id,
            uuid: item.uuid,
            label: item.name,
        });

        // Dispatch change event
        this.element!.dispatchEvent(new Event('change'));
    }

    /* --- Context --- */

    public async _prepareContext(params: Params, context: never) {
        // Construct content links
        const contentLinks = params.talents.map(
            (ref) => `@UUID[${ref.uuid}]{${ref.label}}`,
        );

        // Enrich links
        const enrichedLinks = await Promise.all(
            contentLinks.map((link) => TextEditor.enrichHTML(link)),
        );

        return {
            ...params,
            talentLinks: enrichedLinks,
        };
    }
}

// Register the component
TalentPrerequisiteTalentListComponent.register(
    'app-talent-prerequisite-talent-list',
);
