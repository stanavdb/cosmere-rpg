import { Skill, Attribute } from '@system/types/cosmere';
import { CommonActorData } from '@system/data/actor/common';

import { d20Roll, D20Roll } from '@system/dice';

export class CosmereActor<T extends CommonActorData = CommonActorData> extends Actor<T> {
    public async rollSkill(skillId: Skill, options: any = {}): Promise<D20Roll | null> {
        const skill = this.system.skills[skillId];
        const attribute = this.system.attributes[options.attribute as Attribute ?? skill.attribute];
        const data = this.getRollData();

        // Add attribute mod
        data.mod = skill.mod;
        data.skill = skill;
        data.attribute = attribute;
        data.attributes = this.system.attributes;
        data.defaultAttribute = options.attribute ?? skill.attribute;

        // Prepare roll data
        const flavor = `${CONFIG.COSMERE.skills[skillId].label} Skill Test`;
        const rollData = foundry.utils.mergeObject({
            data,
            title: `${flavor}: ${this.name}`,
            flavor,
            defaultAttribute: skill.attribute,
            messageData: {
                speaker: options.speaker || ChatMessage.getSpeaker({ actor: this })
            }
        }, options);
        rollData.parts = [ '@mod' ].concat(options.parts ?? []);

        // Perform roll
        const roll = await d20Roll(rollData);
        return roll;
    }

    public getRollData(): any {
        return {
            ...super.getRollData(),
            flags: { ...this.flags },
            name: this.name
        }
    }
}