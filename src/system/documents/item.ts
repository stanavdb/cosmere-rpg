import {
    ItemType,
    Skill,
    Attribute,
    ItemConsumeType,
    ActivationType,
    Resource,
} from '@system/types/cosmere';
import { CosmereActor } from './actor';

import {
    WeaponItemDataModel,
    ArmorItemDataModel,
    AncestryItemDataModel,
    CultureItemDataModel,
    PathItemDataModel,
    SpecialtyItemDataModel,
    TalentItemDataModel,
    ConnectionItemDataModel,
    InjuryItemDataModel,
    ActionItemDataModel,
    TraitItemDataModel,
    LootItemDataModel,
    EquipmentItemDataModel,
} from '@system/data/item';

import { ActivatableItemData } from '@system/data/item/mixins/activatable';
import { AttackingItemData } from '@system/data/item/mixins/attacking';
import { DamagingItemData } from '@system/data/item/mixins/damaging';
import { PhysicalItemData } from '@system/data/item/mixins/physical';
import { TypedItemData } from '@system/data/item/mixins/typed';
import { TraitsItemData } from '@system/data/item/mixins/traits';
import { EquippableItemData } from '@system/data/item/mixins/equippable';
import { DescriptionItemData } from '@system/data/item/mixins/description';
import { IdItemData } from '@system/data/item/mixins/id';

import { Derived } from '@system/data/fields';

import { d20Roll, damageRoll, D20Roll, D20RollData } from '@system/dice';

// Constants
const CONSUME_CONFIGURATION_DIALOG_TEMPLATE =
    'systems/cosmere-rpg/templates/item/dialog/item-consume.hbs';
const ACTIVITY_CARD_TEMPLATE =
    'systems/cosmere-rpg/templates/chat/activity-card.hbs';

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

export interface CosmereItemData<
    T extends foundry.abstract.DataSchema = foundry.abstract.DataSchema,
> {
    name: string;
    type: ItemType;
    system?: T;
}

export class CosmereItem<
    T extends foundry.abstract.DataSchema = foundry.abstract.DataSchema,
> extends Item<T, CosmereActor> {
    // Redeclare `item.type` to specifically be of `ItemType`.
    // This way we avoid casting everytime we want to check its type
    declare type: ItemType;

    /* --- ItemType type guards --- */

    public isWeapon(): this is CosmereItem<WeaponItemDataModel> {
        return this.type === ItemType.Weapon;
    }

    public isArmor(): this is CosmereItem<ArmorItemDataModel> {
        return this.type === ItemType.Armor;
    }

    public isAncestry(): this is CosmereItem<AncestryItemDataModel> {
        return this.type === ItemType.Ancestry;
    }

    public isCulture(): this is CosmereItem<CultureItemDataModel> {
        return this.type === ItemType.Culture;
    }

    public isPath(): this is CosmereItem<PathItemDataModel> {
        return this.type === ItemType.Path;
    }

    public isSpecialty(): this is CosmereItem<SpecialtyItemDataModel> {
        return this.type === ItemType.Specialty;
    }

    public isTalent(): this is CosmereItem<TalentItemDataModel> {
        return this.type === ItemType.Talent;
    }

    public isConnection(): this is CosmereItem<ConnectionItemDataModel> {
        return this.type === ItemType.Connection;
    }

    public isInjury(): this is CosmereItem<InjuryItemDataModel> {
        return this.type === ItemType.Injury;
    }

    public isAction(): this is CosmereItem<ActionItemDataModel> {
        return this.type === ItemType.Action;
    }

    public isTrait(): this is CosmereItem<TraitItemDataModel> {
        return this.type === ItemType.Trait;
    }

    /* --- Mixin type guards --- */

    /**
     * Can this item be activated?
     */
    public hasActivation(): this is CosmereItem<ActivatableItemData> {
        return 'activation' in this.system;
    }

    /**
     * Does this item have an attack?
     */
    public hasAttack(): this is CosmereItem<AttackingItemData> {
        return 'attack' in this.system;
    }

    /**
     * Does this item deal damage?
     */
    public hasDamage(): this is CosmereItem<DamagingItemData> {
        return 'damage' in this.system;
    }

    /**
     * Is this item physical?
     */
    public isPhysical(): this is CosmereItem<PhysicalItemData> {
        return 'weight' in this.system && 'price' in this.system;
    }

    /**
     * Does this item have a sub-type?
     */
    public isTyped(): this is CosmereItem<TypedItemData> {
        return 'type' in this.system;
    }

    /**
     * Does this item have traits?
     * Not to be confused adversary traits. (Which are their own item type.)
     */
    public hasTraits(): this is CosmereItem<TraitsItemData> {
        return 'traits' in this.system;
    }

    /**
     * Can this item be equipped?
     */
    public isEquippable(): this is CosmereItem<EquippableItemData> {
        return 'equipped' in this.system;
    }

    /**
     * Does this item have a description?
     */
    public hasDescription(): this is CosmereItem<DescriptionItemData> {
        return 'description' in this.system;
    }

    /**
     * Does this item have an id in it system?
     */
    public hasId(): this is CosmereItem<IdItemData> {
        return 'id' in this.system;
    }

    /* --- Accessors --- */

    public get isFavorite(): boolean {
        return this.getFlag('cosmere-rpg', 'favorites.isFavorite');
    }

    /* --- Roll & Usage utilities --- */

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
        // const flavor =
        //     // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        //     this.system.activation.flavor ||
        //     game
        //         .i18n!.localize('COSMERE.Item.DefaultFlavor')
        //         .replace('[actor]', actor.name)
        //         .replace('[item]', this.name);
        // Flavor currently unused

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
                chatMessage: false,
                title: `${this.name} (${game.i18n!.localize(
                    CONFIG.COSMERE.skills[skillId].label,
                )})`,
                // flavor,
                defaultAttribute: skill.attribute,
                // messageData: {
                //     speaker:
                //         options.speaker ??
                //         (ChatMessage.getSpeaker({ actor }) as ChatSpeakerData),
                // },
            },
            options,
        );
        rollData.parts = ['@mod'].concat(options.parts ?? []);

        // Perform the roll
        return await d20Roll({
            ...rollData,
        });
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
                consumeType === ItemConsumeType.Resource
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
                if (consumeType === ItemConsumeType.Resource) {
                    // Handle actor resource consumption
                    void actor.update({
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

        // Handle item uses
        if (this.system.activation.uses) {
            // Get the current uses
            const currentUses = this.system.activation.uses.value;

            // Validate we can use the item
            if (currentUses < 1) {
                ui.notifications.warn(
                    game.i18n!.localize('GENERIC.Warning.NotEnoughUses'),
                );
                return null;
            }

            // Add post roll action to consume a use
            postRoll.push(() => {
                // Handle use consumption
                void this.update({
                    'system.activation.uses.value': currentUses - 1,
                });
            });
        }

        // Check if a roll is required
        const rollRequired =
            this.system.activation.type === ActivationType.SkillTest;

        // Get the speaker
        const speaker =
            options.speaker ??
            (ChatMessage.getSpeaker({ actor }) as ChatSpeakerData);

        if (rollRequired) {
            // Perform roll
            const roll = await this.roll(options);

            const damageRolls = [] as Roll[];

            // Ensure roll wasn't cancelled
            if (roll !== null) {
                if (this.hasDamage() && this.system.damage.formula) {
                    const skill =
                        this.system.damage.skill ??
                        this.system.activation.skill!;
                    const attribute =
                        this.system.damage.attribute ??
                        this.system.activation.attribute ??
                        CONFIG.COSMERE.skills[skill].attribute;

                    damageRolls.push(
                        await damageRoll({
                            formula: this.system.damage.formula,
                            damageType: this.system.damage.type,
                            data: {
                                mod:
                                    this.actor!.system.skills[skill].rank +
                                    this.actor!.system.attributes[attribute]
                                        .value,
                            },
                        }),
                    );
                }

                // Create chat message
                const message = await ChatMessage.create({
                    user: game.user!.id,
                    speaker,
                    content: await renderTemplate(ACTIVITY_CARD_TEMPLATE, {
                        item: this,
                        skill: this.system.activation.skill,
                        rolls: [roll],
                        damageRolls,
                    }),
                    rolls: [roll, ...damageRolls],
                });

                // Add listeners
                this.attachDamageRollListeners(message as ChatMessage);

                // Perform post roll actions
                postRoll.forEach((action) => action());
            }

            // Return the result
            return roll;
        } else {
            // NOTE: Use boolean or operator (`||`) here instead of nullish coalescing (`??`),
            // as flavor can also be an empty string, which we'd like to replace with the default flavor too
            const flavor =
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                this.system.activation.flavor ||
                game
                    .i18n!.localize('COSMERE.Item.DefaultFlavor')
                    .replace('[actor]', actor.name)
                    .replace('[item]', this.name);

            // Create chat message
            await ChatMessage.create({
                user: game.user!.id,
                speaker,
                content: await renderTemplate(ACTIVITY_CARD_TEMPLATE, {
                    item: this,
                    flavor,
                }),
            });

            // Perform post roll actions
            postRoll.forEach((action) => action());

            return null;
        }
    }

    protected async showConsumeDialog(
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
            consumeType === ItemConsumeType.Resource
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

    private attachDamageRollListeners(message: ChatMessage) {
        console.log(message);

        const buttons = $(
            `.chat-message[data-message-id="${message.id}"] a.damage-button`,
        );
        console.log('BUTTONS', buttons);
    }

    /* --- Functions --- */

    public async recharge() {
        if (!this.hasActivation() || !this.system.activation.uses) return;

        // Recharge resource
        await this.update({
            'system.activation.uses.value': this.system.activation.uses.max,
        });
    }

    public async markFavorite(index: number, render = true) {
        await this.update(
            {
                flags: {
                    'cosmere-rpg': {
                        favorites: {
                            isFavorite: true,
                            sort: index,
                        },
                    },
                },
            },
            { render },
        );
    }

    public async clearFavorite() {
        await Promise.all([
            this.unsetFlag('cosmere-rpg', 'favorites.isFavorite'),
            this.unsetFlag('cosmere-rpg', 'favorites.sort'),
        ]);
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

export type CultureItem = CosmereItem<CultureItemDataModel>;
export type PathItem = CosmereItem<PathItemDataModel>;
export type ConnectionItem = CosmereItem<ConnectionItemDataModel>;
export type InjuryItem = CosmereItem<InjuryItemDataModel>;
export type SpecialtyItem = CosmereItem<SpecialtyItemDataModel>;
export type LootItem = CosmereItem<LootItemDataModel>;
export type ArmorItem = CosmereItem<ArmorItemDataModel>;
export type TraitItem = CosmereItem<TraitItemDataModel>;
export type ActionItem = CosmereItem<ActionItemDataModel>;
export type TalentItem = CosmereItem<TalentItemDataModel>;
export type EquipmentItem = CosmereItem<EquipmentItemDataModel>;
export type WeaponItem = CosmereItem<WeaponItemDataModel>;
