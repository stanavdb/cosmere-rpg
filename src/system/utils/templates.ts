import { SYSTEM_ID } from '../constants';

/**
 * Index of identifiers for system templates.
 */
export const TEMPLATES = {
    CHAT_CARD_HEADER: 'chat/card-header.hbs',
    CHAT_CARD_CONTENT: 'chat/card-content.hbs',
    CHAT_CARD_SECTION: 'chat/card-section.hbs',
    CHAT_CARD_DESCRIPTION: 'chat/card-description.hbs',

    CHAT_ROLL_D20: 'chat/roll-d20.hbs',
    CHAT_ROLL_TOOLTIP: 'chat/roll-tooltip.hbs',

    CHAT_CARD_ROLLS: 'chat/parts/chat-card-rolls.hbs',
    CHAT_CARD_ACTIONS: 'chat/parts/chat-card-actions.hbs',
} as const;

/**
 * Shortcut function to render a custom template from the system templates folder.
 * @param {string} template Name (or sub path) of the template in the templates folder.
 * @param {object} data The template data to render the template with.
 * @returns {Promise<string>} A rendered html template.
 * @private
 */
export function renderSystemTemplate(
    template: string,
    data: object,
): Promise<string> {
    return renderTemplate(`systems/${SYSTEM_ID}/templates/${template}`, data);
}
