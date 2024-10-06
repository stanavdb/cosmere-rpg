Hooks.on('ready', async () => {
    // Ensure this message is only displayed when creating a new world
    if (
        !game.user!.isGM ||
        !game.settings!.get('cosmere-rpg', 'firstTimeWorldCreation')
    )
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
    await game.settings!.set('cosmere-rpg', 'firstTimeWorldCreation', false);
});

Hooks.on('ready', async () => {
    const currentVersion = game.system!.version;
    const latestVersion = game.settings!.get(
        'cosmere-rpg',
        'latestVersion',
    ) as string;

    if (currentVersion > latestVersion) {
        // Record the latest version of the system
        await game.settings!.set(
            'cosmere-rpg',
            'latestVersion',
            currentVersion,
        );
    }
});
