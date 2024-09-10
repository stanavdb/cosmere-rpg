import { WeaponId, ArmorId } from '@system/types/cosmere';

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
    };
}

/* --- Default Export --- */

export default {
    registerWeapon,
    registerArmor,
    registerCulture,
};
