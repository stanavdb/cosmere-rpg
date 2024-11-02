import { DamageType } from '@system/types/cosmere';
import { D20Roll } from '@system/dice/d20-roll';
import { DamageRoll } from '@system/dice/damage-roll';

import { CosmereActor } from './actor';
import { renderSystemTemplate, TEMPLATES } from '../utils/templates';

const ACTIVITY_CARD_TEMPLATE =
    'systems/cosmere-rpg/templates/chat/activity-card.hbs';
const ACTIVITY_CARD_MAX_HEIGHT = 1040;
const ACTIVITY_CARD_TOTAL_TRANSITION_DURATION = 0.9;

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

    public get hasSkillTest(): boolean {
        return this.d20Rolls.length > 0;
    }

    public get hasDamage(): boolean {
        return this.damageRolls.length > 0;
    }

    /* --- Rendering --- */
    public override async getHTML(): Promise<JQuery> {
        const html = await super.getHTML();

        // Enrich the chat card
        await this.enrichCardHeader(html);

        if (this.isContentVisible) {
            await this.enrichCardContent(html);

            html.find('.dice-roll').on('click', (event) =>
                this.onClickDiceRoll(event),
            );
        }
        //await this.enrichChatCard(html);

        return html;
    }

    protected async enrichCardHeader(html: JQuery) {
        const actor = this.associatedActor;

        let img;
        let name;

        if (this.isContentVisible) {
            img = actor?.img ?? this.author.avatar;
            name = this.alias;
        } else {
            img = this.author.avatar;
            name = this.author.name;
        }

        const headerHTML = await renderSystemTemplate(
            TEMPLATES.CHAT_CARD_HEADER,
            {
                img,
                name,
                subtitle:
                    name !== this.author.name ? this.author.name : undefined,
                timestamp: html.find('.message-timestamp').text(),
                canRepeat: this.hasSkillTest || this.hasDamage,
            },
        );

        // Replace header
        html.find('.message-header').replaceWith(headerHTML);

        const deleteButton = html
            .find('.message-metadata')
            .find('.message-delete');
        if (!game.user!.isGM) deleteButton?.remove();
    }

    protected async enrichCardContent(html: JQuery) {
        const content = $(
            await renderSystemTemplate(TEMPLATES.CHAT_CARD_CONTENT, {}),
        );

        await this.enrichSkillTest(content);
        await this.enrichDamage(content);

        // Replace content
        html.find('.message-content').replaceWith(content);
    }

    protected async enrichSkillTest(html: JQuery) {
        if (!this.hasSkillTest) return;

        const d20Roll = this.d20Rolls[0];
        const skill = d20Roll?.options?.data?.skill;

        if (!skill) return;

        const sectionHTML = await renderSystemTemplate(
            TEMPLATES.CHAT_CARD_SECTION,
            {
                type: 'skill',
                icon: 'fa-regular fa-dice-d20',
                title: game.i18n!.localize('GENERIC.SkillTest'),
                subtitle: {
                    skill: CONFIG.COSMERE.skills[skill.id].label,
                    attribute:
                        CONFIG.COSMERE.attributes[skill.attribute].labelShort,
                },
            },
        );

        html.find('.chat-card').append(sectionHTML);

        const rollHTML = await d20Roll.getHTML();
        const roll = $(rollHTML as unknown as HTMLElement);
        const tooltip = roll.find('.dice-tooltip');
        this.enrichD20Tooltip(d20Roll, tooltip[0]);
        tooltip.prepend(roll.find('.dice-formula'));

        const section = html.find('.chat-card-section.skill');
        section.append(roll);
    }

    protected async enrichDamage(html: JQuery) {
        if (!this.hasDamage) return;

        const sectionHTML = await renderSystemTemplate(
            TEMPLATES.CHAT_CARD_SECTION,
            {
                type: 'damage',
                icon: 'fa-solid fa-burst',
                title: game.i18n!.localize('GENERIC.Damage'),
            },
        );

        html.find('.chat-card').append(sectionHTML);
    }

    /**
     * Augment roll tooltips with some additional information and styling.
     * @param {Roll} roll The roll instance.
     * @param {HTMLElement} html The roll tooltip markup.
     */
    protected enrichD20Tooltip(roll: Roll, html: HTMLElement) {
        const constant = Number(
            roll.terms
                .filter((r) => r instanceof foundry.dice.terms.NumericTerm)
                .reduce((acc, curr) => acc + curr.number, 0),
        );
        if (!constant) return;
        const sign = constant < 0 ? '-' : '+';
        const part = document.createElement('section');
        part.classList.add('tooltip-part', 'constant');
        part.innerHTML = `
            <div class="dice">
                <ol class="dice-rolls"></ol>
                <div class="total">
                <span class="value"><span class="sign">${sign}</span>${Math.abs(constant)}</span>
                </div>
            </div>
            `;
        html.appendChild(part);
    }

    /**
     * Listen for shift key being pressed to show the chat message "delete" icon, or released (or focus lost) to hide it.
     */
    public static activateListeners() {
        window.addEventListener(
            'keydown',
            () => this.toggleModifiers({ releaseAll: false }),
            { passive: true },
        );
        window.addEventListener(
            'keyup',
            () => this.toggleModifiers({ releaseAll: false }),
            { passive: true },
        );
        window.addEventListener(
            'blur',
            () => this.toggleModifiers({ releaseAll: true }),
            { passive: true },
        );
    }

    /**
     * Toggles attributes on the chatlog based on which modifier keys are being held.
     * @param {object} [options]
     * @param {boolean} [options.releaseAll=false]  Force all modifiers to be considered released.
     */
    private static toggleModifiers({ releaseAll = false }) {
        document.querySelectorAll('.chat-sidebar > ol').forEach((chatlog) => {
            const chatlogHTML = chatlog as HTMLElement;
            for (const key of Object.values(KeyboardManager.MODIFIER_KEYS)) {
                if (game.keyboard!.isModifierActive(key) && !releaseAll)
                    chatlogHTML.dataset[`modifier${key}`] = '';
                else delete chatlogHTML.dataset[`modifier${key}`];
            }
        });
    }

    /**
     * Handle dice roll expansion.
     * @param {PointerEvent} event  The triggering event.
     * @protected
     */
    private onClickDiceRoll(event: JQuery.ClickEvent) {
        event.stopPropagation();
        const target = event.currentTarget as HTMLElement;
        target?.classList.toggle('expanded');
    }

    protected async enrichChatCard(html: JQuery) {
        const actor = this.associatedActor;

        const name = this.isContentVisible ? this.alias : this.author.name;

        // Render header
        const header = await renderTemplate(TEMPLATES.CHAT_CARD_HEADER, {
            img: this.isContentVisible
                ? (actor?.img ?? this.author.avatar)
                : this.author.avatar,
            name,
            subtitle: name !== this.author.name ? this.author.name : undefined,
            timestamp: html.find('.message-timestamp').text(),
        });

        // Replace header
        html.find('.message-header').replaceWith(header);

        // Get flags
        const rolltable = this.getFlag('core', 'RollTable') as
            | string
            | undefined;

        // Render rolls
        if (!rolltable) await this.renderRolls(html);

        // Render actions
        await this.renderActions(html);

        // Attach activity card listeners
        html.find('.chat-card.activity .header.description').on(
            'click',
            (event) => {
                // Get element
                const element = $(event.target).closest('.header.description');

                // Check if the description is collapsed
                const isCollapsed = element.hasClass('collapsed');

                // Toggle collapsed
                if (isCollapsed) {
                    element.removeClass('collapsed');
                } else {
                    // Get the description element
                    const descriptionEl = element.find('.description');

                    // Get the height
                    const height = descriptionEl.height();

                    // Calculate transition duration
                    const duration =
                        (ACTIVITY_CARD_TOTAL_TRANSITION_DURATION /
                            ACTIVITY_CARD_MAX_HEIGHT) *
                        height! *
                        2;

                    // Set max height to height and transition to duration
                    descriptionEl
                        .css('margin-top', `.3rem`)
                        .css('max-height', `${height}px`)
                        .css('transition', `0s`);

                    setTimeout(() => {
                        // Change transition
                        descriptionEl
                            .css('margin-top', '')
                            .css('max-height', `0`)
                            .css('transition', `${duration}s`);

                        // Add collapsed class
                        element.addClass('collapsed');

                        setTimeout(() => {
                            // Remove max height and transition
                            descriptionEl
                                .css('max-height', '')
                                .css('transition', '');
                        }, duration * 1000);
                    });
                }
            },
        );
    }

    protected async renderRolls(html: JQuery) {
        if (!this.isContentVisible) return;

        const d20Rolls = this.rolls.filter((r) => r instanceof D20Roll);
        const damageRolls = this.rolls.filter((r) => r instanceof DamageRoll);
        const remainingRolls = this.rolls.filter(
            (r) => !(r instanceof D20Roll) && !(r instanceof DamageRoll),
        );

        // Render d20 rolls
        const rollsHtml = await renderTemplate(TEMPLATES.CHAT_CARD_ROLLS, {
            rolls: [...d20Rolls, ...remainingRolls],
            damageRolls,
        });

        // Remove existing rolls
        html.find('.message-content .dice-roll').remove();

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

        html.find('[data-action="undo-damage"]').on('click', (event) => {
            // Get element
            const element = $(event.target).closest(
                '[data-action="undo-damage"]',
            );

            // Get the actor
            const actor = this.associatedActor;
            if (!actor) return;

            // Get the amount
            const amount = Number(element.data('amount'));

            // Undo damage
            void actor.applyDamage(
                { amount: amount, type: DamageType.Healing },
                { chatMessage: false },
            );

            // Strikethrough the damage
            element
                .closest('.damage-notification')
                .css('text-decoration', 'line-through');

            // Remove the action
            element.remove();
        });
    }

    protected async renderActions(html: JQuery) {
        if (!this.isContentVisible) return;

        const hasActions = this.hasDamage;
        if (!hasActions) return;

        const groups = [] as ChatMessageAction[][];

        if (this.hasDamage) {
            if (this.isAuthor && this.hasSkillTest) {
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

                ...(this.hasSkillTest
                    ? [
                          {
                              name: game.i18n!.localize(
                                  'COSMERE.ChatMessage.Action.ApplyGraze',
                              ),
                              icon: 'fa-solid fa-shield-halved',
                              callback: this.onApplyDamage.bind(this, false),
                          },
                      ]
                    : []),

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
        const actionsHtml = await renderTemplate(TEMPLATES.CHAT_CARD_ACTIONS, {
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
                amount: (r.total ?? 0) + (includeMod ? (r.mod ?? 0) : 0),
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
                amount: (r.total ?? 0) + (includeMod ? (r.mod ?? 0) : 0),
                type: DamageType.Healing,
            })),
        );
    }
}
