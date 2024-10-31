// Dialogs
import { ReleaseNotesDialog } from '@system/applications/dialogs/release-notes';
import { SYSTEM_ID } from '../constants';
import { getSystemSetting, SETTINGS } from '../settings';

Hooks.on('ready', async () => {
    // Ensure this message is only displayed when creating a new world
    if (!game.user!.isGM || !getSystemSetting(SETTINGS.INTERNAL_FIRST_CREATION))
        return;

    // Get system version
    const version = game.system!.version;

    // Display the welcome message
    await ChatMessage.create({
        content: game
            .i18n!.localize('COSMERE.ChatMessage.Welcome')
            .replace('[version]', version),
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
