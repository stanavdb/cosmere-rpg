// Dialogs
import { ReleaseNotesDialog } from '@system/applications/dialogs/release-notes';
import {
    SYSTEM_ID,
    METALWORKS_DISCORD_INVITE,
    GITHUB_ISSUES_URL,
    GITHUB_CONTRIBUTING_URL,
    AUTHOR_NAME,
} from '@system/constants';
import { getSystemSetting, SETTINGS } from '../settings';

Hooks.on('ready', async () => {
    // Ensure this message is only displayed when creating a new world
    if (!game.user!.isGM || !getSystemSetting(SETTINGS.INTERNAL_FIRST_CREATION))
        return;

    // Get system version
    const version = game.system!.version;

    // Display the welcome message
    await ChatMessage.create({
        content: game.i18n!.format('COSMERE.ChatMessage.Welcome', {
            version,
            discordLink: METALWORKS_DISCORD_INVITE,
            issuesLink: GITHUB_ISSUES_URL,
            contributingLink: GITHUB_CONTRIBUTING_URL,
        }),
        speaker: {
            alias: AUTHOR_NAME,
        },
        flags: {
            [SYSTEM_ID]: {
                headerImg: `systems/${SYSTEM_ID}/assets/icons/the-metalworks.png`,
            },
        },
    });

    // Mark the setting so the message doesn't appear again
    await game.settings!.set(SYSTEM_ID, 'firstTimeWorldCreation', false);
});

Hooks.on('ready', async () => {
    // Ensure user is a GM
    if (!game.user!.isGM) return;

    const currentVersion = game.system!.version;
    const latestVersion = getSystemSetting(
        SETTINGS.INTERNAL_LATEST_VERSION,
    ) as string;

    if (currentVersion > latestVersion) {
        // Record the latest version of the system
        await game.settings!.set(SYSTEM_ID, 'latestVersion', currentVersion);

        // Show the release notes
        void ReleaseNotesDialog.show();
    }
});
