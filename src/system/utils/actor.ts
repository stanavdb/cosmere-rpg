import { CreatureType } from '@system/types/cosmere';
import { CommonActorData } from '@system/data/actor/common';

export function getTypeLabel(type: CommonActorData['type']): string {
    // Check if type is a custom type
    const isCustom = type.id === CreatureType.Custom;

    // Get subtype
    const subtype = type.subtype;

    // Get config
    const typeConfig = CONFIG.COSMERE.creatureTypes[type.id];

    // Get primary type label
    const primaryLabel =
        isCustom && type.custom
            ? type.custom
            : game.i18n!.localize(typeConfig.label);

    // Construct type label
    return `${primaryLabel} ${subtype ? `(${subtype})` : ''}`.trim();
}
