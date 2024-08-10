import { Skill, Attribute, AttributeGroup } from '@system/types/cosmere';
import { CosmereActor } from '@system/documents/actor';

Handlebars.registerHelper('greaterThan', 
    (a: number, b: number, equal?: boolean) => !!equal ? a >= b : a > b
);

Handlebars.registerHelper('concatArray', (a: any[], b: any[]) => {
    return  [...a, ...b];
});

Handlebars.registerHelper('arraySortAlpha', (arr: string[]) => {
    return arr.sort((a, b) => a.localeCompare(b))
});

Handlebars.registerHelper('skillsForAttributeGroup', (group: AttributeGroup) => {
    // Get attributes
    const attributes = CONFIG.COSMERE.attributeGroups[group].attributes;

    // Get skills
    const skills = attributes
        .map(key => CONFIG.COSMERE.attributes[key].skills)
        .flat()
        .sort((a, b) => a.localeCompare(b));

    return skills;
});

Handlebars.registerHelper('lookupSkillConfig', (skill: Skill) => {
    return CONFIG.COSMERE.skills[skill];
});

Handlebars.registerHelper('attrFromSkill', (skill: Skill) => {
    return Object.keys(CONFIG.COSMERE.attributes)
        .find(
            attrKey => CONFIG.COSMERE
                .attributes[attrKey as Attribute]
                .skills
                .includes(skill)
        )
});

Handlebars.registerHelper('lookupSkillRank', (skill: Skill, actor: CosmereActor) => {
    return actor.system.skills[skill].rank;
});

Handlebars.registerHelper('lookupSkillMod', (skill: Skill, actor: CosmereActor) => {
    return actor.system.skills[skill].mod;
});