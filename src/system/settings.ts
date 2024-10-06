export function registerSettings() {
    game.settings!.register('cosmere-rpg', 'firstTimeWorldCreation', {
        name: 'First Time World Creation',
        scope: 'world',
        config: false,
        default: true,
        type: Boolean,
    });
}
