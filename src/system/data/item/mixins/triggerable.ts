import { CosmereItem } from '@system/documents';

// Fields
import { CollectionField } from '@system/data/fields/collection';

export const enum ItemEvent {
    // Actor events
    AddToActor = 'add-to-actor',
    RemoveFromActor = 'remove-from-actor',
    AddToCharacter = 'add-to-character',
    RemoveFromCharacter = 'remove-from-character',
    AddToAdversary = 'add-to-adversary',
    RemoveFromAdversary = 'remove-from-adversary',
}

export const enum ItemTriggerActionType {
    GrantItems = 'grant-items',
    RemoveItems = 'remove-items',
}

export interface BaseItemTriggerAction<
    Type extends ItemTriggerActionType,
    Data = unknown,
> {
    type: Type;
    data: Data;
}

export type GrantItemAction = BaseItemTriggerAction<
    ItemTriggerActionType.GrantItems,
    { items: string[] }
>;
export type RemoveItemAction = BaseItemTriggerAction<
    ItemTriggerActionType.RemoveItems,
    { items: string[] }
>;

export type ItemTriggerAction = GrantItemAction | RemoveItemAction;

export interface ItemTrigger {
    /**
     * The event that triggers the action.
     */
    event: ItemEvent;

    /**
     * The action to take when the event is triggered.
     */
    action: ItemTriggerAction;
}

export interface TriggerableItemData {
    /**
     * The triggers for the item.
     */
    triggers: Collection<ItemTrigger>;
}

export function TriggerableItemMixin<P extends CosmereItem>() {
    return (
        base: typeof foundry.abstract.TypeDataModel<TriggerableItemData, P>,
    ) => {
        return class mixin extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    triggers: new CollectionField(
                        new foundry.data.fields.SchemaField({
                            event: new foundry.data.fields.StringField({
                                required: true,
                                nullable: false,
                                blank: false,
                                initial: ItemEvent.AddToActor,
                                choices: {
                                    [ItemEvent.AddToActor]: 'Added to Actor',
                                    [ItemEvent.RemoveFromActor]:
                                        'Removed from Actor',
                                    [ItemEvent.AddToCharacter]:
                                        'Added to Character',
                                    [ItemEvent.RemoveFromCharacter]:
                                        'Removed from Character',
                                },
                            }),
                            action: new foundry.data.fields.SchemaField(
                                {
                                    type: new foundry.data.fields.StringField({
                                        required: true,
                                        nullable: false,
                                        blank: false,
                                        initial:
                                            ItemTriggerActionType.GrantItems,
                                        choices: {
                                            [ItemTriggerActionType.GrantItems]:
                                                'Grant Items',
                                            [ItemTriggerActionType.RemoveItems]:
                                                'Remove Items',
                                        },
                                    }),
                                    data: new foundry.data.fields.SchemaField(
                                        {
                                            items: new foundry.data.fields.ArrayField(
                                                new foundry.data.fields.StringField(),
                                            ),
                                        },
                                        { required: true },
                                    ),
                                },
                                { required: true },
                            ),
                        }),
                    ),
                });
            }
        };
    };
}
