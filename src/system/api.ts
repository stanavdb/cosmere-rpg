import {
    EquipmentType,
    WeaponId,
    ArmorId,
    PathType,
} from '@system/types/cosmere';

import { CurrencyConfig } from '@system/types/config';

interface EquipmentTypeConfigData {
    id: string;
    label: string;
}

export function registerEquipmentType(
    data: EquipmentTypeConfigData,
    force = false,
) {
    if (!CONFIG.COSMERE)
        throw new Error('Cannot access api until after system is initialized.');

    if (data.id in CONFIG.COSMERE.items.equipment.types && !force)
        throw new Error('Cannot override existing equipment type config.');

    if (force) {
        console.warn('Registering equipment type with force=true.');
    }

    // Add to equipment types
    CONFIG.COSMERE.items.equipment.types[data.id as EquipmentType] = {
        label: data.label,
    };
}

interface WeaponConfigData {
    id: string;
    label: string;
    reference: string;
    specialExpertise?: boolean;
}

export function registerWeapon(data: WeaponConfigData, force = false) {
    if (!CONFIG.COSMERE)
        throw new Error('Cannot access api until after system is initialized.');

    if (data.id in CONFIG.COSMERE.weapons && !force)
        throw new Error('Cannot override existing weapon config.');

    if (force) {
        console.warn('Registering weapon with force=true.');
    }

    // Add to weapons config
    CONFIG.COSMERE.weapons[data.id as WeaponId] = {
        label: data.label,
        reference: data.reference,
        specialExpertise: data.specialExpertise,
    };
}

interface ArmorConfigData {
    id: string;
    label: string;
    reference: string;
}

export function registerArmor(data: ArmorConfigData, force = false) {
    if (!CONFIG.COSMERE)
        throw new Error('Cannot access api until after system is initialized.');

    if (data.id in CONFIG.COSMERE.armors && !force)
        throw new Error('Cannot override existing armor config.');

    if (force) {
        console.warn('Registering armor with force=true.');
    }

    // Add to armors config
    CONFIG.COSMERE.armors[data.id as unknown as ArmorId] = {
        label: data.label,
        reference: data.reference,
    };
}

interface CultureConfigData {
    id: string;
    label: string;
    reference: string;
}

export function registerCulture(data: CultureConfigData, force = false) {
    if (!CONFIG.COSMERE)
        throw new Error('Cannot access api until after system is initialized.');

    if (data.id in CONFIG.COSMERE.armors && !force)
        throw new Error('Cannot override existing culture config.');

    if (force) {
        console.warn('Registering culture with force=true.');
    }

    // Add to cultures config
    CONFIG.COSMERE.cultures[data.id] = {
        label: data.label,
        reference: data.reference,
    };
}

interface AncestryConfigData {
    id: string;
    label: string;
    reference: string;
}

export function registerAncestry(data: AncestryConfigData, force = false) {
    if (!CONFIG.COSMERE)
        throw new Error('Cannot access api until after system is initialized.');

    if (data.id in CONFIG.COSMERE.armors && !force)
        throw new Error('Cannot override existing ancestry config.');

    if (force) {
        console.warn('Registering ancestry with force=true.');
    }

    // Add to ancestry config
    CONFIG.COSMERE.ancestries[data.id] = {
        label: data.label,
        reference: data.reference,
    };
}

interface PathTypeConfigData {
    id: string;
    label: string;
}

export function registerPathType(data: PathTypeConfigData, force = false) {
    if (!CONFIG.COSMERE)
        throw new Error('Cannot access api until after system is initialized.');

    if (data.id in CONFIG.COSMERE.armors && !force)
        throw new Error('Cannot override existing path type config.');

    if (force) {
        console.warn('Registering path type with force=true.');
    }

    // Add to path config
    CONFIG.COSMERE.paths.types[data.id as PathType] = {
        label: data.label,
    };
}

interface CurrencyConfigData extends CurrencyConfig {
    id: string;
}

export function registerCurrency(data: CurrencyConfigData, force = false) {
    if (!CONFIG.COSMERE)
        throw new Error('Cannot access api until after system is initialized.');

    if (data.id in CONFIG.COSMERE.currencies && !force)
        throw new Error('Cannot override existing currency config.');

    if (force) {
        console.warn('Registering currency with force=true.');
    }

    // Ensure a base denomination is configured
    if (!data.denominations.primary.some((d) => d.base))
        throw new Error(`Currency ${data.id} must have a base denomination.`);
    if (
        data.denominations.secondary &&
        !data.denominations.secondary.some((d) => d.base)
    )
        throw new Error(
            `Secondary denominations for currency ${data.id} must have a base denomination.`,
        );

    // Get base denomination
    const baseDenomination = data.denominations.primary.find((d) => d.base)!;

    // Ensure base denomination has a unit
    if (!baseDenomination.unit)
        throw new Error(
            `Base denomination ${baseDenomination.id} for currency ${data.id} must have a unit.`,
        );

    // Add to currency config
    CONFIG.COSMERE.currencies[data.id] = {
        label: data.label,
        denominations: data.denominations,
    };
}

/* --- Default Export --- */

export default {
    registerEquipmentType,
    registerWeapon,
    registerArmor,
    registerCulture,
    registerAncestry,
    registerPathType,
    registerCurrency,
};
