import {
    Skill,
    Attribute,
    ActorType,
    Condition,
    ItemType,
    ExpertiseType,
} from '@system/types/cosmere';
import { CosmereItem, CosmereItemData } from '@system/documents/item';
import { CommonActorDataModel } from '@system/data/actor/common';
import { CharacterActorDataModel } from '@system/data/actor/character';
import { AdversaryActorDataModel } from '@system/data/actor/adversary';
import { Derived } from '@system/data/fields';

import { d20Roll, D20Roll, D20RollData } from '@system/dice';

import { TalentItemData } from '@system/data/item/talent';

// Dialogs
import { ShortRestDialog } from '@system/applications/actor/dialogs/short-rest';

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

interface LongRestOptions {
    /**
     * Whether or not to display the rest dialog.
     * @default true
     */
    dialog?: boolean;
}

interface ShortRestOptions extends LongRestOptions {
    /**
     * The character whose Medicine modifier to add
     * to the recovery die roll.
     */
    tendedBy?: CharacterActor;
}

export class CosmereActor<
    T extends CommonActorDataModel = CommonActorDataModel,
> extends Actor<T, CosmereItem> {
    // Redeclare `actor.type` to specifically be of `ActorType`.
    // This way we avoid casting everytime we want to check/use its type
    declare type: ActorType;

    /* --- Accessors --- */

    public get conditions(): Set<Condition> {
        return this.statuses as Set<Condition>;
    }

    public get applicableEffects(): ActiveEffect[] {
        const effects = new Array<ActiveEffect>();
        for (const effect of this.allApplicableEffects()) {
            effects.push(effect);
        }
        return effects;
    }

    public get favorites(): CosmereItem[] {
        return this.items
            .filter((i) => i.getFlag('cosmere-rpg', 'favorites.isFavorite'))
            .sort(
                (a, b) =>
                    a.getFlag<number>('cosmere-rpg', 'favorites.sort') -
                    b.getFlag<number>('cosmere-rpg', 'favorites.sort'),
            );
    }

    /* --- Type Guards --- */

    public isCharacter(): this is CharacterActor {
        return this.type === ActorType.Character;
    }

    public isAdversary(): this is AdversaryActor {
        return this.type === ActorType.Adversary;
    }

    /* --- Lifecycle --- */

    public override async createEmbeddedDocuments(
        embeddedName: string,
        data: object[],
        opertion?: Partial<foundry.abstract.DatabaseCreateOperation>,
    ): Promise<foundry.abstract.Document[]> {
        const postCreateActions = new Array<() => void>();

        if (embeddedName === 'Item') {
            const itemData = data as CosmereItemData[];

            // Get the first ancestry item
            const ancestryItem = itemData.find(
                (d) => d.type === ItemType.Ancestry,
            );

            // Filter out any ancestry items beyond the first
            data = itemData.filter(
                (d) => d.type !== ItemType.Ancestry || d === ancestryItem,
            );

            // If an ancestry item was present, replace the current (after create)
            if (ancestryItem) {
                // Get current ancestry item
                const currentAncestryItem = this.items.find(
                    (i) => i.type === ItemType.Ancestry,
                );

                // Remove existing ancestry after create, if present
                if (currentAncestryItem) {
                    postCreateActions.push(() => {
                        void this.deleteEmbeddedDocuments('Item', [
                            currentAncestryItem.id,
                        ]);
                    });
                }
            }

            // Get all talent items
            const talentItems = itemData.filter(
                (d) => d.type === ItemType.Talent,
            ) as CosmereItemData<TalentItemData>[];

            // Get all unique granted expertises that are not present on the actor
            const grantedExpertises = talentItems
                .filter((item) => item.system?.grantsExpertises?.length)
                .map((item) => item.system!.grantsExpertises!)
                .flat()
                .filter(
                    (v, i, self) => self.findIndex((o) => o.id === v.id) === i,
                )
                .filter(
                    (expertise) =>
                        !this.system.expertises?.some(
                            (o) => o.id === expertise.id,
                        ),
                )
                .map((expertise) => ({ ...expertise, locked: true }));

            // Add expertise after create
            if (grantedExpertises.length > 0) {
                postCreateActions.push(() => {
                    void this.update({
                        'system.expertises': [
                            ...(this.system.expertises ?? []),
                            ...grantedExpertises,
                        ],
                    });
                });
            }
        }

        // Perform create
        const result = await super.createEmbeddedDocuments(
            embeddedName,
            data,
            opertion,
        );

        // Post create actions
        postCreateActions.forEach((func) => func());

        // Return result
        return result;
    }

    public override async deleteEmbeddedDocuments(
        embeddedName: string,
        ids: string[],
        operation?: Partial<foundry.abstract.DatabaseDeleteOperation>,
    ): Promise<foundry.abstract.Document[]> {
        const postDeleteActions = new Array<() => void>();

        if (embeddedName === 'Item') {
            // Get items that will be deleted
            const deleteItems = this.items.filter((i) => ids.includes(i.id));

            // Get talent items
            const talentItems = deleteItems.filter((item) => item.isTalent());

            // Get all unique granted expertises
            const grantedExpertiseIds = talentItems
                .filter((talent) => talent.system.grantsExpertises?.length)
                .map((talent) => talent.system.grantsExpertises!)
                .flat()
                .map((expertise) => expertise.id)
                .filter((v, i, self) => self.indexOf(v) === i);

            // Remove granted expertises after delete
            if (grantedExpertiseIds.length > 0) {
                postDeleteActions.push(() => {
                    void this.update({
                        'system.expertises': this.system.expertises?.filter(
                            (expertise) =>
                                !grantedExpertiseIds.includes(expertise.id),
                        ),
                    });
                });
            }
        }

        // Perform delete
        const result = await super.deleteEmbeddedDocuments(
            embeddedName,
            ids,
            operation,
        );

        // Post delete actions
        postDeleteActions.forEach((func) => func());

        // Return result
        return result;
    }

    /* --- Functions --- */

    public *allApplicableEffects() {
        for (const effect of super.allApplicableEffects()) {
            if (
                !(effect.parent instanceof CosmereItem) ||
                !effect.parent.isEquippable() ||
                effect.parent.system.equipped
            ) {
                yield effect;
            }
        }
    }

    /**
     * Utility function to get the modifier for a given skill for this actor.
     * @param skill The skill to get the modifier for
     * @param attributeOverride An optional attribute override, used instead of the default attribute
     */
    public getSkillMod(skill: Skill, attributeOverride?: Attribute): number {
        // Get attribute
        const attribute =
            attributeOverride ?? CONFIG.COSMERE.skills[skill].attribute;

        // Get skill rank
        const rank = this.system.skills[skill].rank;

        // Get attribute value
        const attrValue = this.system.attributes[attribute].value;

        return attrValue + rank;
    }

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
     * Utility function to increment/decrement a skill value
     */
    public async modifySkillRank(
        skillId: Skill,
        incrementBool = true,
        render = true,
    ) {
        const skillpath = `system.skills.${skillId}.rank`;
        const skill = this.system.skills[skillId];
        if (incrementBool) {
            await this.update(
                { [skillpath]: Math.clamp(skill.rank + 1, 0, 5) },
                { render },
            );
        } else {
            await this.update(
                { [skillpath]: Math.clamp(skill.rank - 1, 0, 5) },
                { render },
            );
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

    /**
     * Utility function to handle short resting.
     * This function takes care of rolling the recovery die.
     * Automatically applies the appropriate Medicine modifier.
     */
    public async shortRest(options: ShortRestOptions = {}) {
        if (!this.isCharacter()) return;

        // Defaults
        options.dialog = options.dialog ?? true;

        // Show the dialog if required
        if (options.dialog) {
            const result = await ShortRestDialog.show(this, options);

            if (!result.performRest) return;
            else {
                options.tendedBy = result.tendedBy;
            }
        }

        // Get Medicine mod, if required
        const mod = options.tendedBy
            ? Derived.getValue(options.tendedBy.system.skills.med.mod)
            : undefined;

        // Construct formula
        const formula = [Derived.getValue(this.system.recovery.die), mod]
            .filter((v) => !!v)
            .join(' + ');

        // Evaluate the roll
        const roll = Roll.create(formula);
        await roll.evaluate();

        // Set up flavor
        let flavor = game
            .i18n!.localize('ROLLS.Recovery')
            .replace('[character]', this.name);
        if (options.tendedBy) {
            flavor += ` ${game
                .i18n!.localize('ROLLS.RecoveryTend')
                .replace('[tender]', options.tendedBy.name)}`;
        }

        // Chat message
        await roll.toMessage({
            flavor,
        });
    }

    /**
     * Utility function to handle long resting.
     * Long resting grants the following benefits:
     * - Recover all lost health
     * - Recover all lost focus
     * - Reduce Exhausted penalty by 1 (TODO)
     */
    public async longRest(options: LongRestOptions = {}) {
        // Defaults
        options.dialog = options.dialog ?? true;

        // Show the confirm dialog if required
        if (options.dialog) {
            const shouldContinue = await new Promise((resolve) => {
                void new foundry.applications.api.DialogV2({
                    window: {
                        title: 'COSMERE.Actor.Sheet.LongRest',
                    },
                    content: `<span>${game.i18n!.localize(
                        'COSMERE.Actor.Sheet.ShouldPerformLongRest',
                    )}</span>`,
                    buttons: [
                        {
                            label: 'GENERIC.Button.Continue',
                            action: 'continue',
                            // NOTE: Callback must be async
                            // eslint-disable-next-line @typescript-eslint/require-await
                            callback: async () => resolve(true),
                        },
                        {
                            label: 'GENERIC.Button.Cancel',
                            action: 'cancel',
                            // eslint-disable-next-line @typescript-eslint/require-await
                            callback: async () => resolve(false),
                        },
                    ],
                    modal: true,
                }).render(true);
            });

            if (!shouldContinue) return;
        }

        // Update the actor
        await this.update({
            'system.resources.hea.value': Derived.getValue(
                this.system.resources.hea.max,
            ),
            'system.resources.foc.value': Derived.getValue(
                this.system.resources.foc.max,
            ),
        });
    }

    public getRollData() {
        return {
            ...super.getRollData(),
        };
    }

    /**
     * Utility function to determine if an actor has a given expertise
     */
    public hasExpertise(type: ExpertiseType, id: string): boolean {
        return (
            this.system.expertises?.some(
                (expertise) => expertise.type === type && expertise.id === id,
            ) ?? false
        );
    }
}
