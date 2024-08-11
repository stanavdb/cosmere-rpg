import { Skill, Attribute } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents/item';
import { CommonActorDataModel } from '@system/data/actor/common';
import { CharacterActorDataModel } from '@system/data/actor/character';
import { AdversaryActorDataModel } from '@system/data/actor/adversary';

import { 
    d20Roll, 
    D20Roll, 
    D20RollData 
} from '@system/dice';

export type CharacterActor = CosmereActor<CharacterActorDataModel>;
export type AdversaryActor = CosmereActor<AdversaryActorDataModel>;

interface RollSkillOptions {
    /**
     * The attribute to be used with this skill roll.
     * Used to roll a skill with an alternate attribute.
     * 
     * @default - The attribute associated with this skill
     */
    attribute?: Attribute;

    /**
     * The dice roll component parts, excluding the initial d20
     * @default []
     */
    parts?: string[];

    /**
     * Who is sending the chat message for this roll?
     * 
     * @default - ChatMessage.getSpeaker({ actor })`
     */
    speaker?: ChatSpeakerData;
}

export class CosmereActor<T extends CommonActorDataModel = CommonActorDataModel> extends Actor<T, CosmereItem> {
    public async rollSkill(skillId: Skill, options: RollSkillOptions = {}): Promise<D20Roll | null> {
        const skill = this.system.skills[skillId];
        const attribute = this.system.attributes[options.attribute ?? skill.attribute];
        const data = this.getRollData() as D20RollData;

        // Add attribute mod
        data.mod = skill.mod;
        data.skill = skill;
        data.attribute = attribute;
        data.attributes = this.system.attributes;
        data.defaultAttribute = options.attribute ?? skill.attribute;

        // Prepare roll data
        const flavor = `${CONFIG.COSMERE.skills[skillId].label} ${game.i18n.localize("COSEMERE.SkillTest")}`;
        const rollData = foundry.utils.mergeObject({
            data,
            title: `${flavor}: ${this.name}`,
            flavor,
            defaultAttribute: skill.attribute,
            messageData: {
                speaker: options.speaker ?? 
                    ChatMessage.getSpeaker({ actor: this }) as ChatSpeakerData
            }
        }, options);
        rollData.parts = [ '@mod' ].concat(options.parts ?? []);

        // Perform and return roll
        return await d20Roll(rollData);
    }

    public getRollData() {
        return {
            ...super.getRollData()
        }
    }
}