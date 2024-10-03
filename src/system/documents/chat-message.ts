import { DamageType } from '@system/types/cosmere';
import { CosmereActor } from './actor';

import { D20Roll } from '@system/dice/d20-roll';
import { DamageRoll } from '@system/dice/damage-roll';

// Constants
const CHAT_CARD_HEADER_TEMPLATE =
    'systems/cosmere-rpg/templates/chat/parts/chat-card-header.hbs';
const CHAT_CARD_ROLLS_TEMPLATE =
    'systems/cosmere-rpg/templates/chat/parts/chat-card-rolls.hbs';
const CHAT_CARD_ACTIONS_TEMPLATE =
    'systems/cosmere-rpg/templates/chat/parts/chat-card-actions.hbs';

interface ChatMessageAction {
    name: string;
    icon: string;
    callback?: () => void;
}

export class CosmereChatMessage extends ChatMessage {
    /* --- Accessors --- */

    public get associatedActor(): CosmereActor | null {
        // NOTE: game.scenes resolves to any type
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access */
        if (this.speaker.scene && this.speaker.token) {
            const scene = game.scenes.get(this.speaker.scene);
            const token = scene?.tokens?.get(this.speaker.token);
            if (token) return token.actor;
        }
        return game.actors?.get(this.speaker.actor);
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access */
    }

    public get d20Rolls(): D20Roll[] {
        return this.rolls.filter((r) => r instanceof D20Roll);
    }

    public get damageRolls(): DamageRoll[] {
        return this.rolls.filter((r) => r instanceof DamageRoll);
    }

    public get hasDamage(): boolean {
        return this.damageRolls.length > 0;
    }

    /* --- Rendering --- */

    public override async getHTML(): Promise<JQuery> {
        const html = await super.getHTML();

        // Enrich the chat card
        await this.enrichChatCard(html);

        return html;
    }

    protected async enrichChatCard(html: JQuery) {
        const actor = this.associatedActor;

        const name = this.isContentVisible ? this.alias : this.author.name;

        // Render header
        const header = await renderTemplate(CHAT_CARD_HEADER_TEMPLATE, {
            img: this.isContentVisible
                ? (actor?.img ?? this.author.avatar)
                : this.author.avatar,
            name,
            subtitle: name !== this.author.name ? this.author.name : undefined,
            timestamp: html.find('.message-timestamp').text(),
        });

        // Replace header
        html.find('.message-header').replaceWith(header);

        // Render rolls
        await this.renderRolls(html);

        // Render actions
        await this.renderActions(html);
    }

    protected async renderRolls(html: JQuery) {
        const d20Rolls = this.rolls.filter((r) => r instanceof D20Roll);
        const damageRolls = this.rolls.filter((r) => r instanceof DamageRoll);

        // Render d20 rolls
        const rollsHtml = await renderTemplate(CHAT_CARD_ROLLS_TEMPLATE, {
            rolls: d20Rolls,
            damageRolls,
        });

        // Append rolls
        html.find('.message-content').append(rollsHtml);

        // Attach listeners
        html.find('.dice-total').on('click', (event) => {
            // Get element
            const element = $(event.target).closest('.dice-total');

            // Check if dice total has collapsed class
            if (element.hasClass('collapsed')) element.removeClass('collapsed');
            else element.addClass('collapsed');
        });
    }

    protected async renderActions(html: JQuery) {
        const hasActions = this.hasDamage;
        if (!hasActions) return;

        const groups = [] as ChatMessageAction[][];

        if (this.hasDamage) {
            if (this.isAuthor) {
                groups.push([
                    {
                        name: game.i18n!.localize(
                            'COSMERE.ChatMessage.Action.Graze',
                        ),
                        icon: 'fa-solid fa-droplet-slash',
                        callback: this.onDoGraze.bind(this),
                    },
                ]);
            }

            groups.push([
                {
                    name: game.i18n!.localize(
                        'COSMERE.ChatMessage.Action.ApplyDamage',
                    ),
                    icon: 'fa-solid fa-heart-crack',
                    callback: this.onApplyDamage.bind(this),
                },
                {
                    name: game.i18n!.localize(
                        'COSMERE.ChatMessage.Action.ApplyGraze',
                    ),
                    icon: 'fa-solid fa-shield-halved',
                    callback: this.onApplyDamage.bind(this, false),
                },
                {
                    name: game.i18n!.localize(
                        'COSMERE.ChatMessage.Action.ApplyHealing',
                    ),
                    icon: 'fa-solid fa-heart-circle-plus',
                    callback: this.onApplyHealing.bind(this),
                },
            ]);
        }

        // Render actions
        const actionsHtml = await renderTemplate(CHAT_CARD_ACTIONS_TEMPLATE, {
            hasActions: groups.length > 0,
            groups,
        });

        // Append actions
        html.find('.message-content').append(actionsHtml);

        // Attach listeners
        html.find('.card-actions .action[data-item]').on('click', (event) => {
            // Get the index
            const [groupIndex, index] = (
                $(event.target)
                    .closest('.action[data-item]')
                    .data('item') as string
            )
                .split('-')
                .map(Number) as [number, number];

            // Get the item
            const item = groups[groupIndex][index];

            // Trigger the callback
            if (item.callback) item.callback();
        });
    }

    /* --- Handlers --- */

    private onDoGraze() {
        // Get associated actor
        const actor = this.associatedActor;
        if (!actor)
            return ui.notifications.warn(
                game.i18n!.localize('GENERIC.Warning.NoActor'),
            );

        if (actor.system.resources.foc.value === 0)
            return ui.notifications.warn(
                game.i18n!.localize('GENERIC.Warning.NoFocus'),
            );

        // Reduce focus
        void actor.update({
            'system.resources.foc.value': actor.system.resources.foc.value - 1,
        });

        // Notify
        ui.notifications.info(
            game.i18n!.localize('GENERIC.Notification.GrazeFocusSpent'),
        );
    }

    private onApplyDamage(includeMod = true) {
        // Get selected actor
        const actor = (game.canvas!.tokens!.controlled?.[0]?.actor ??
            game.user?.character) as CosmereActor | undefined;

        if (!actor)
            return ui.notifications.warn(
                game.i18n!.localize('GENERIC.Warning.NoActor'),
            );

        // Get damage rolls
        const damageRolls = this.damageRolls;

        // Apply damage
        void actor.applyDamage(
            ...damageRolls.map((r) => ({
                amount: (r.total ?? 0) + (includeMod ? r.mod : 0),
                type: r.damageType,
            })),
        );
    }

    private onApplyHealing(includeMod = true) {
        // Get selected actor
        const actor = (game.canvas!.tokens!.controlled?.[0]?.actor ??
            game.user?.character) as CosmereActor | undefined;

        if (!actor)
            return ui.notifications.warn(
                game.i18n!.localize('GENERIC.Warning.NoActor'),
            );

        // Get damage rolls
        const damageRolls = this.damageRolls;

        // Apply damage
        void actor.applyDamage(
            ...damageRolls.map((r) => ({
                amount: (r.total ?? 0) + (includeMod ? r.mod : 0),
                type: DamageType.Healing,
            })),
        );
    }
}
