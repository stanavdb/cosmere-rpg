import { Skill, Attribute, AttributeGroup } from '@system/types/cosmere';
import { CharacterActor } from '@system/documents/actor';

Handlebars.registerHelper('greaterThan', 
    (a: number, b: number, equal?: boolean) => !!equal ? a >= b : a > b
);

Handlebars.registerHelper('expertisesList', (actor: CharacterActor, defaultValue: string = '-') => {
    if (actor.system.expertises.length === 0) return defaultValue;
    return actor.system.expertises
        .map(expertise => `${expertise.label} (${CONFIG.COSMERE.expertiseTypes[expertise.type].label})`)
        .join(', ');
});