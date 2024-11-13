import { DamageType, InjuryType } from '@system/types/cosmere';
import { D20Roll } from '@system/dice/d20-roll';
import { DamageRoll } from '@system/dice/damage-roll';

import { CosmereActor } from './actor';
import { renderSystemTemplate, TEMPLATES } from '../utils/templates';
import { SYSTEM_ID } from '../constants';
import { AdvantageMode } from '../types/roll';
import { getSystemSetting, SETTINGS } from '../settings';
import { getApplyTargets } from '../utils/generic';

const ACTIVITY_CARD_MAX_HEIGHT = 1040;
const ACTIVITY_CARD_TOTAL_TRANSITION_DURATION = 0.9;

interface ChatMessageAction {
    name: string;
    icon: string;
    callback?: () => void;
}

export const MESSAGE_TYPES = {
    SKILL: 'skill',
    ACTION: 'action',
    INJURY: 'injury',
} as Record<string, string>;

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

    public get hasInjury(): boolean {
        return this.getFlag(SYSTEM_ID, 'injury') !== undefined;
    }

    /* --- Rendering --- */
    public override async getHTML(): Promise<JQuery> {
        const html = await super.getHTML();

        // Enrich the chat card
        await this.enrichCardHeader(html);
        await this.enrichCardContent(html);

        html.find('.collapsible').on('click', (event) =>
            this.onClickCollapsible(event),
        );
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
        if (!this.isContentVisible) return;

        const type = this.getFlag(SYSTEM_ID, 'message.type') as string;
        if (!type || !Object.values(MESSAGE_TYPES).includes(type)) return;

        const content = $(
            await renderSystemTemplate(TEMPLATES.CHAT_CARD_CONTENT, {}),
        );

        //await this.enrichDescription(content);
        await this.enrichSkillTest(content);
        await this.enrichDamage(content);
        await this.enrichInjury(content);

        // Replace content
        html.find('.message-content').replaceWith(content);

        // Setup hover buttons when the message is actually hovered(for optimisation).
        let hoverSetupComplete = false;
        content.on('mouseenter', async () => {
            if (!hoverSetupComplete) {
                hoverSetupComplete = true;
                await this.enrichCardOverlay(content);
            }
            this.onOverlayHoverStart(content);
        });

        content.on('mouseleave', () => {
            this.onOverlayHoverEnd(content);
        });

        // Run hover end once to ensure all hover buttons are in the correct state.
        this.onOverlayHoverEnd(content);
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
                content: await d20Roll.getHTML(),
            },
        );

        const section = $(sectionHTML as unknown as HTMLElement);
        const tooltip = section.find('.dice-tooltip');
        this.enrichD20Tooltip(d20Roll, tooltip[0]);
        tooltip.prepend(section.find('.dice-formula'));

        html.find('.chat-card').append(section);
    }

    protected async enrichDamage(html: JQuery) {
        if (!this.hasDamage) return;

        const footer = getSystemSetting(SETTINGS.CHAT_ENABLE_APPLY_BUTTONS)
            ? await renderSystemTemplate(TEMPLATES.CHAT_CARD_DAMAGE_BUTTONS, {
                  overlay: !getSystemSetting(SETTINGS.CHAT_ALWAYS_SHOW_BUTTONS),
              })
            : undefined;

        const sectionHTML = await renderSystemTemplate(
            TEMPLATES.CHAT_CARD_SECTION,
            {
                type: 'damage',
                icon: 'fa-solid fa-burst',
                title: game.i18n!.localize('GENERIC.Damage'),
                footer,
            },
        );

        const section = $(sectionHTML as unknown as HTMLElement);

        section.find('.apply-buttons button').on('click', async (event) => {
            await this.onClickApplyButton(event);
        });

        html.find('.chat-card').append(sectionHTML);
    }

    protected async enrichInjury(html: JQuery) {
        if (!this.hasInjury) return;

        const injury = TableResult.fromSource(
            this.getFlag(SYSTEM_ID, 'injury.details'),
        );
        const injuryRoll = Roll.fromData(
            this.getFlag(SYSTEM_ID, 'injury.roll'),
        );

        const data: { type: InjuryType; durationFormula: string } =
            injury?.getFlag(SYSTEM_ID, 'injury-data');
        const durationRoll = this.rolls.find(
            (r) => !(r instanceof D20Roll) && !(r instanceof DamageRoll),
        );

        // Current required because of a bug in the roll table
        if ((data.type as string) === 'ViciousInjury')
            data.type = InjuryType.ViciousInjury;

        let title;
        const actor = this.associatedActor?.name ?? 'Actor';
        switch (data.type) {
            case InjuryType.Death:
                title = game.i18n!.format(
                    'COSMERE.ChatMessage.InjuryDuration.Dead',
                    { actor },
                );
                break;
            case InjuryType.PermanentInjury:
                title = game.i18n!.format(
                    'COSMERE.ChatMessage.InjuryDuration.Permanent',
                    { actor },
                );
                break;
            default: {
                title = game.i18n!.format(
                    'COSMERE.ChatMessage.InjuryDuration.Temporary',
                    { actor, days: durationRoll?.total ?? 0 },
                );
                break;
            }
        }

        const sectionHTML = await renderSystemTemplate(
            TEMPLATES.CHAT_CARD_INJURY,
            {
                title,
                img: injury.img,
                description: injury.text,
                formula: injuryRoll?.formula,
                total: injuryRoll?.total,
                tooltip: await injuryRoll?.getTooltip(),
                type: game.i18n!.localize(
                    CONFIG.COSMERE.injury.types[data.type].label,
                ),
            },
        );

        const section = $(sectionHTML as unknown as HTMLElement);
        const tooltip = section.find('.dice-tooltip');
        this.enrichD20Tooltip(injuryRoll, tooltip[0]);
        tooltip.prepend(section.find('.dice-formula'));

        html.find('.chat-card').append(section);
    }

    /**
     * Augment roll tooltips with some additional information and styling.
     * @param {Roll} roll The roll instance.
     * @param {HTMLElement} html The roll tooltip markup.
     */
    protected enrichD20Tooltip(roll: Roll, html: HTMLElement) {
        let previous: unknown;
        let constant = 0;
        for (const term of roll.terms) {
            if (term instanceof foundry.dice.terms.NumericTerm) {
                if (
                    previous instanceof foundry.dice.terms.OperatorTerm &&
                    previous.operator === '-'
                ) {
                    constant -= term.number;
                } else {
                    constant += term.number;
                }
            }
            previous = term;
        }

        if (constant === 0) return;

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
     * Adds overlay buttons to a chat card for retroactively making a roll into a multi roll or a crit.
     * @param {JQuery} html The object to add overlay buttons to.
     */
    protected async enrichCardOverlay(html: JQuery) {
        if (!getSystemSetting(SETTINGS.CHAT_ENABLE_OVERLAY_BUTTONS)) return;

        const overlayD20 = await renderSystemTemplate(
            TEMPLATES.CHAT_OVERLAY_D20,
            {
                imgAdvantage: `systems/${SYSTEM_ID}/assets/icons/svg/dice/retro-adv.svg`,
                imgDisadvantage: `systems/${SYSTEM_ID}/assets/icons/svg/dice/retro-dis.svg`,
            },
        );

        html.find('.roll-d20 .dice-total').append($(overlayD20));
        html.find('.overlay-d20 div').on('click', async (event) => {
            await this.onClickOverlayD20(event);
        });

        //const overlayCrit = await renderSystemTemplate(TEMPLATES.CHAT_OVERLAY_CRIT, {});

        // html.find('.rsr-damage .dice-total').append($(overlayCrit));

        // html.find(".rsr-overlay-crit div").click(async event => {
        //     await _processRetroCritButtonEvent(message, event);
        // });
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
        const rollsHtml = await renderTemplate(TEMPLATES.CHAT_ROLL_D20, {
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
        const actionsHtml = await renderTemplate(TEMPLATES.CHAT_CARD_CONTENT, {
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

    /**
     * Handles a d20 overlay button click event.
     * @param {JQuery.ClickEvent} event The originating event of the button click.
     */
    private async onClickOverlayD20(event: JQuery.ClickEvent) {
        event.preventDefault();
        event.stopPropagation();

        const button = event.currentTarget as HTMLElement;
        const action = button.dataset.action;
        const state = button.dataset.state;

        if (action === 'retro' && state) {
            const roll = this.d20Rolls[0];

            const d20BaseTerm = roll.terms.find(
                (d) => d instanceof foundry.dice.terms.Die && d.faces === 20,
            ) as foundry.dice.terms.Die;

            if (!d20BaseTerm || d20BaseTerm.number === 2) return;

            const d20Additional = await new Roll(
                `${2 - d20BaseTerm.number!}d20${d20BaseTerm.modifiers.join('')}`,
            ).evaluate();

            const modifiers = new Array<
                keyof (typeof foundry.dice.terms.Die)['MODIFIERS']
            >();
            d20BaseTerm.modifiers.forEach((m) =>
                modifiers.push(
                    m as keyof (typeof foundry.dice.terms.Die)['MODIFIERS'],
                ),
            );

            const d20Forced = new foundry.dice.terms.Die({
                number: 2,
                faces: 20,
                results: [
                    ...d20BaseTerm.results,
                    ...d20Additional.dice[0].results,
                ],
                modifiers,
            });
            d20Forced.keep(state);
            d20Forced.modifiers.push(state);

            roll.terms[roll.terms.indexOf(d20BaseTerm)] = d20Forced;
            roll.options.advantageMode =
                state === 'kh'
                    ? AdvantageMode.Advantage
                    : state === 'kl'
                      ? AdvantageMode.Disadvantage
                      : AdvantageMode.None;

            void this.update({ rolls: this.rolls });
        }
    }

    /**
     * Handles an apply button click event.
     * @param {JQuery.ClickEvent} event The originating event of the button click.
     */
    private async onClickApplyButton(
        event: JQuery.ClickEvent,
        forceRolls = null,
    ) {
        event.preventDefault();
        event.stopPropagation();

        const button = event.currentTarget as HTMLElement;
        const action = button.dataset.action;
        const multiplier = Number(button.dataset.multiplier);

        if (action === 'apply-damage' && multiplier) {
            const targets = getApplyTargets();
            if (targets.size === 0) return;

            const damageRolls = forceRolls ?? this.damageRolls;

            const damageToApply = damageRolls.map((r) => ({
                amount: (r.total ?? 0) * multiplier,
                type: r.damageType,
            }));

            await Promise.all(
                Array.from(targets).map(async (t) => {
                    const target = t.actor as CosmereActor;
                    return await target.applyDamage(...damageToApply);
                }),
            );
        }
    }

    /**
     * Handles collapsible sections expansion on click event.
     * @param {PointerEvent} event  The triggering event.
     */
    private onClickCollapsible(event: JQuery.ClickEvent) {
        event.stopPropagation();
        const target = event.currentTarget as HTMLElement;
        target?.classList.toggle('expanded');
    }

    /**
     * Handles hover begin events on the given html/jquery object.
     * @param {JQuery} html The object to handle hover begin events for.
     * @private
     */
    private onOverlayHoverStart(html: JQuery) {
        const hasPermission = game.user!.isGM || this.isAuthor;

        html.find('.overlay').show();
        html.find('.overlay-d20').toggle(
            hasPermission &&
                this.hasSkillTest &&
                !(
                    this.d20Rolls[0].hasAdvantage ||
                    this.d20Rolls[0].hasDisadvantage
                ),
        );
        html.find('.overlay-crit').toggle(hasPermission && this.hasDamage);
    }

    /**
     * Handles hover end events on the given html/jquery object.
     * @param {JQuery} html The object to handle hover end events for.
     * @private
     */
    private onOverlayHoverEnd(html: JQuery) {
        html.find('.overlay').attr('style', 'display: none;');
    }

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
