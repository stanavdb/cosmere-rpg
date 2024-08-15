import {
    ItemType,
    Skill,
    Attribute,
    ItemConsumeType,
} from '@system/types/cosmere';
import { CosmereActor } from './actor';

import { ActivatableItemData } from '@system/data/item/mixins/activatable';
import { DamagingItemData } from '@system/data/item/mixins/damaging';
import { Derived } from '@system/data/fields';

import { d20Roll, D20Roll, D20RollData } from '@system/dice';

// Constants
const CONSUME_CONFIGURATION_DIALOG_TEMPLATE =
    'systems/cosmere-rpg/templates/item/dialog/item-consume.hbs';

interface ShowConsumeDialogOptions {
    /**
     * The default state of the consume checkbox in the dialog
     */
    shouldConsume?: boolean;

    /**
     * The title of the dialog window
     */
    title?: string;

    /**
     * The consumption type
     */
    consumeType?: ItemConsumeType;
}

export class CosmereItem<
    T extends foundry.abstract.DataSchema = foundry.abstract.DataSchema,
> extends Item<T, CosmereActor> {
    // Redeclare `item.type` to specifically be of `ItemType`.
    // This way we avoid casting everytime we want to check its type
    declare type: ItemType;

    /**
     * Can this item be activated?
     */
    public hasActivation(): this is CosmereItem<ActivatableItemData> {
        return 'activation' in this.system;
    }

    /**
     * Does this item deal damage?
     */
    public hasDamage(): this is CosmereItem<DamagingItemData> {
        return 'damage' in this.system;
    }

    /**
     * Roll utility for activable items.
     * This function **only** performs the roll, it does not consume resources.
     * For item usages with resource consumtion use `item.use` instead.
     */
    public async roll(
        options: CosmereItem.RollItemOptions = {},
    ): Promise<D20Roll | null> {
        if (!this.hasActivation()) return null;

        // Get skill to use
        const skillId = options.skill ?? this.system.activation.skill;
        if (!skillId) return null;

        // Get the actor to roll for (either assigned through option, the parent of this item, or the first controlled actor)
        const actor =
            options.actor ??
            this.actor ??
            (game.canvas?.tokens?.controlled?.[0]?.actor as
                | CosmereActor
                | undefined);

        // Ensure an actor was found
        if (!actor) {
            ui.notifications.warn(
                game.i18n!.localize('GENERIC.Warning.NoActor'),
            );
            return null;
        }

        const skill = actor.system.skills[skillId];

        // Get the attribute id
        const attributeId =
            options.attribute ??
            this.system.activation.attribute ??
            skill.attribute;

        const attribute = actor.system.attributes[attributeId];

        // NOTE: Use boolean or operator (`||`) here instead of nullish coalescing (`??`),
        // as flavor can also be an empty string, which we'd like to replace with the default flavor too
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const flavor =
            this.system.activation.flavor ||
            game
                .i18n!.localize('COSMERE.Item.DefaultFlavor')
                .replace('[actor]', actor.name)
                .replace('[item]', this.name);

        // Set up actor data
        const data: D20RollData = {
            mod: Derived.getValue(skill.mod)!,
            skill,
            attribute,
            attributes: actor.system.attributes,
            defaultAttribute: attributeId,
            ...actor.getRollData(),
        };

        // Prepare roll data
        const rollData = foundry.utils.mergeObject(
            {
                data,
                title: `${this.name} (${game.i18n!.localize(
                    CONFIG.COSMERE.skills[skillId].label,
                )})`,
                flavor,
                defaultAttribute: skill.attribute,
                messageData: {
                    speaker:
                        options.speaker ??
                        (ChatMessage.getSpeaker({ actor }) as ChatSpeakerData),
                },
            },
            options,
        );
        rollData.parts = ['@mod'].concat(options.parts ?? []);

        // Perform the roll
        return await d20Roll(rollData);
    }

    /**
     * Utility for using activatable items.
     * This function handles resource validation/consumption and dice rolling.
     */
    public async use(
        options: CosmereItem.UseItemOptions = {},
    ): Promise<D20Roll | null> {
        if (!this.hasActivation()) return null;

        // Set up post roll actions
        const postRoll: (() => void)[] = [];

        // Get the actor to use this item for
        const actor =
            options.actor ??
            this.actor ??
            (game.canvas?.tokens?.controlled?.[0]?.actor as
                | CosmereActor
                | undefined);

        // Ensure an actor was found
        if (!actor) {
            ui.notifications.warn(
                game.i18n!.localize('GENERIC.Warning.NoActor'),
            );
            return null;
        }

        // Determine whether or not resource consumption is available
        const consumptionAvailable =
            options.shouldConsume !== false && !!this.system.activation.consume;

        if (consumptionAvailable) {
            if (
                this.system.activation.consume!.type === ItemConsumeType.Charge
            ) {
                // Ensure charges are configured
                if (!this.system.resources?.charge) {
                    ui.notifications.warn(
                        game.i18n!.localize(
                            'GENERIC.Warning.ItemConsumeResourceNotConfigured',
                        ),
                    );
                    return null;
                }
            }
        }

        // Determine if we should handle resource consumption
        const shouldConsume =
            consumptionAvailable &&
            (options.shouldConsume === true ||
                (await this.showConsumeDialog()));

        // If the dialog was closed, exit out of use action
        if (shouldConsume === null) return null;

        // Handle resource consumption
        if (shouldConsume) {
            const consumeType = this.system.activation.consume!.type;
            const consumeAmount = this.system.activation.consume!.value;

            // The the current amount
            const currentAmount =
                consumeType === ItemConsumeType.Charge
                    ? this.system.resources!.charge!.value
                    : consumeType === ItemConsumeType.Resource
                      ? actor.system.resources[
                            this.system.activation.consume!.resource!
                        ].value
                      : consumeType === ItemConsumeType.Item
                        ? 0 // TODO: Figure out how to handle item consumption
                        : 0;

            // Validate we can consume the amount
            const newAmount = currentAmount - consumeAmount;
            if (newAmount < 0) {
                ui.notifications.warn(
                    game.i18n!.localize('GENERIC.Warning.NotEnoughResource'),
                );
                return null;
            }

            // Add post roll action to consume the resource
            postRoll.push(() => {
                if (consumeType === ItemConsumeType.Charge) {
                    // Handle charge consumption
                    // Consume the charges
                    this.update({
                        system: {
                            resources: {
                                charge: {
                                    value: newAmount,
                                },
                            },
                        },
                    });
                } else if (consumeType === ItemConsumeType.Resource) {
                    // Handle actor resource consumption
                    actor.update({
                        system: {
                            resources: {
                                [this.system.activation.consume!
                                    .resource as string]: {
                                    value: newAmount,
                                },
                            },
                        },
                    });
                } else if (consumeType === ItemConsumeType.Item) {
                    // Handle item consumption
                    // TODO: Figure out how to handle item consumption

                    ui.notifications.warn(
                        game
                            .i18n!.localize('GENERIC.Warning.NotImplemented')
                            .replace('[action]', 'Item consumption'),
                    );
                }
            });
        }

        // Perform roll
        const result = await this.roll(options);

        // Ensure roll wasn't cancelled
        if (result !== null) {
            // Perform post roll actions
            postRoll.forEach((action) => action());
        }

        // Return the result
        return result;
    }

    private async showConsumeDialog(
        options: ShowConsumeDialogOptions = {},
    ): Promise<boolean | null> {
        if (!this.hasActivation()) return false;
        if (!this.system.activation.consume) return false;

        const consumeType =
            options.consumeType ?? this.system.activation.consume.type;
        const shouldConsume = options.shouldConsume ?? true;
        const amount = this.system.activation.consume.value;
        const title =
            options.title ?? game.i18n!.localize('DIALOG.ItemConsume.Title');

        // Determine consumed resource label
        const consumedResourceLabel =
            consumeType === ItemConsumeType.Charge
                ? game.i18n!.localize(
                      `COSMERE.Item.Activation.Resources.Charge.${amount > 1 ? 'Plural' : 'Singular'}`,
                  )
                : consumeType === ItemConsumeType.Resource
                  ? game.i18n!.localize(
                        CONFIG.COSMERE.resources[
                            this.system.activation.consume.resource!
                        ].label,
                    )
                  : consumeType === ItemConsumeType.Item
                    ? '[TODO ITEM]'
                    : game.i18n!.localize('GENERIC.Unknown');

        // Render the dialog inner HTML
        const content = await renderTemplate(
            CONSUME_CONFIGURATION_DIALOG_TEMPLATE,
            {
                consumedResourceLabel,
                amount,
                shouldConsume,
            },
        );

        // Return promise that resolves with the dialog result
        return new Promise((resolve) => {
            new Dialog({
                title,
                content,
                buttons: {
                    continue: {
                        label: game.i18n!.localize('GENERIC.Button.Continue'),
                        callback: (html) => {
                            const form = $(html)[0].querySelector(
                                'form',
                            )! as HTMLFormElement & {
                                shouldConsume: HTMLInputElement;
                            };

                            resolve(form.shouldConsume.checked);
                        },
                    },
                },
                default: 'continue',
                close: () => resolve(null),
            }).render(true);
        });
    }
}

export namespace CosmereItem {
    export interface RollItemOptions {
        /**
         * The actor for which to roll this item.
         * Used to determine the modifier for the roll.
         */
        actor?: CosmereActor;

        /**
         * The skill to be used with this item roll.
         * Used to roll the item with an alternate skill.
         */
        skill?: Skill;

        /**
         * The attribute to be used with this item roll.
         * Used to roll the item with an alternate attribute.
         */
        attribute?: Attribute;

        /**
         * The dice roll component parts, excluding the initial d20
         * @default []
         */
        parts?: string[];

        /**
         * Who is sending the chat message for this roll?
         *
         * @default - ChatMessage.getSpeaker({ actor })`
         */
        speaker?: ChatSpeakerData;
    }

    export interface UseItemOptions extends RollItemOptions {
        /**
         * Whether or not the item usage should consume.
         * Only used if the item has consumption configured.
         */
        shouldConsume?: boolean;
    }
}
