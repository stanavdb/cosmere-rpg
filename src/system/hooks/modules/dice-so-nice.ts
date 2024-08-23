import { IMPORTED_RESOURCES } from '@system/constants';

Hooks.once('diceSoNiceReady', (dice3d: Dice3D) => {
    dice3d.addSystem({ id: 'cosmere-rpg', name: 'Cosmere RPG' }, true);
    dice3d.addDicePreset({
        type: 'dp',
        labels: [
            IMPORTED_RESOURCES.PLOT_DICE_C2,
            IMPORTED_RESOURCES.PLOT_DICE_C4,
            IMPORTED_RESOURCES.PLOT_DICE_BLANK,
            IMPORTED_RESOURCES.PLOT_DICE_BLANK,
            IMPORTED_RESOURCES.PLOT_DICE_OP,
            IMPORTED_RESOURCES.PLOT_DICE_OP,
        ],
        bumpMaps: [
            IMPORTED_RESOURCES.PLOT_DICE_C2_BUMP,
            IMPORTED_RESOURCES.PLOT_DICE_C4_BUMP,
            IMPORTED_RESOURCES.PLOT_DICE_BLANK_BUMP,
            IMPORTED_RESOURCES.PLOT_DICE_BLANK_BUMP,
            IMPORTED_RESOURCES.PLOT_DICE_OP_BUMP,
            IMPORTED_RESOURCES.PLOT_DICE_OP_BUMP,
        ],
        system: 'cosmere-rpg',
    });
});
