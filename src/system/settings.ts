export function registerSettings() {
    game.settings!.register('cosmere-rpg', 'firstTimeWorldCreation', {
        name: 'First Time World Creation',
        scope: 'world',
        config: false,
        default: true,
        type: Boolean,
    });

    game.settings!.register('cosmere-rpg', 'latestVersion', {
        name: 'Latest Version',
        scope: 'world',
        config: false,
        default: '0.0.0',
        type: String,
    });
}
