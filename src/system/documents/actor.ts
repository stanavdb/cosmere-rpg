import { Skill, Attribute } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents/item';
import { CommonActorDataModel } from '@system/data/actor/common';
import { CharacterActorDataModel } from '@system/data/actor/character';
import { AdversaryActorDataModel } from '@system/data/actor/adversary';
import { Derived } from '@system/data/fields';

import { d20Roll, D20Roll, D20RollData } from '@system/dice';

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

export class CosmereActor<
    T extends CommonActorDataModel = CommonActorDataModel,
> extends Actor<T, CosmereItem> {
    /**
     * Roll a skill for this actor
     */
    public async rollSkill(
        skillId: Skill,
        options: RollSkillOptions = {},
    ): Promise<D20Roll | null> {
        const skill = this.system.skills[skillId];
        const attribute =
            this.system.attributes[options.attribute ?? skill.attribute];
        const data = this.getRollData() as D20RollData;

        // Add attribute mod
        data.mod = Derived.getValue(skill.mod)!;
        data.skill = skill;
        data.attribute = attribute;
        data.attributes = this.system.attributes;
        data.defaultAttribute = options.attribute ?? skill.attribute;

        // Prepare roll data
        const flavor = `${game.i18n!.localize(
            CONFIG.COSMERE.skills[skillId].label,
        )} ${game.i18n!.localize('GENERIC.SkillTest')}`;
        const rollData = foundry.utils.mergeObject(
            {
                data,
                title: `${flavor}: ${this.name}`,
                flavor,
                defaultAttribute: skill.attribute,
                messageData: {
                    speaker:
                        options.speaker ??
                        (ChatMessage.getSpeaker({
                            actor: this,
                        }) as ChatSpeakerData),
                },
            },
            options,
        );
        rollData.parts = ['@mod'].concat(options.parts ?? []);

        // Perform roll
        const roll = await d20Roll(rollData);
        return roll;
    }

    /**
     * Utility function to roll an item for this actor
     */
    public async rollItem(
        item: CosmereItem,
        options?: Omit<CosmereItem.RollItemOptions, 'actor'>,
    ): Promise<D20Roll | null> {
        return item.roll({ ...options, actor: this });
    }

    /**
     *  Utility function to increment/decrement a skill value
     */
    public modifySkillRank(skillId: Skill, incrementBool = true) {
        const skillpath = `system.skills.${skillId}.rank`;
        const skill = this.system.skills[skillId];
        if (incrementBool) {
            void this.update({ [skillpath]: Math.clamp(skill.rank + 1, 0, 5) });
        } else {
            void this.update({ [skillpath]: Math.clamp(skill.rank - 1, 0, 5) });
        }
    }

    /**
     * Utility function to use an item for this actor
     */
    public async useItem(
        item: CosmereItem,
        options?: Omit<CosmereItem.UseItemOptions, 'actor'>,
    ): Promise<D20Roll | null> {
        return item.use({ ...options, actor: this });
    }

    public getRollData() {
        return {
            ...super.getRollData(),
        };
    }
}
