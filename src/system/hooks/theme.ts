Hooks.on('ready', () => {
    // Global light/dark theme.
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) =>
        forceDarkColorScheme(),
    );

    // Force dark theme
    forceDarkColorScheme();
});

Hooks.on('closeSettingsConfig', () => {
    // Force dark theme
    forceDarkColorScheme();
});

/* --- Helper --- */

function forceDarkColorScheme() {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
}
