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
