import { Attribute, Skill } from '@system/types/cosmere';
import { AnyObject, DeepPartial } from '@system/types/utils';

// Documents
import { CharacterActor } from '@system/documents/actor';
import { CosmereItem, TalentTreeItem } from '@system/documents/item';

// Component System
import { ComponentHandlebarsApplicationMixin } from '@system/applications/component-system';

// ApplicationV2
const { ApplicationV2 } = foundry.applications.api;

// Utils
import * as AdvancementUtils from '@system/utils/advancement';

// Constants
import { SYSTEM_ID } from '@system/constants';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

export class CharacterBuilder extends ComponentHandlebarsApplicationMixin(
    ApplicationV2,
)<AnyObject> {
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.DEFAULT_OPTIONS),
        {
            classes: [SYSTEM_ID, 'character-builder', 'application'],
            window: {
                frame: false,
                minimizable: false,
                resizable: false,
            },
            position: {
                top: 0,
                left: 0,
            },
            actions: {
                close: this._onCloseClick,
                'select-item': this._onSelectItem,
                'select-step': this._onSelectStep,
                'assign-attribute': this._onAssignAttribute,
                'assign-skill': this._onAssignSkill,
            },
        },
    );
    /* eslint-enable @typescript-eslint/unbound-method */

    static PARTS = foundry.utils.mergeObject(
        foundry.utils.deepClone(super.PARTS),
        {
            header: {
                template: `systems/${SYSTEM_ID}/templates/character-builder/parts/header.hbs`,
            },
            content: {
                template: `systems/${SYSTEM_ID}/templates/character-builder/parts/content.hbs`,
            },
        },
    );

    private _character: CharacterActor;
    private _steps: any[] = [];

    private currentStep = 0;
    private initalized = false;

    private constructor(character: CharacterActor) {
        super(
            foundry.utils.mergeObject(CharacterBuilder.DEFAULT_OPTIONS, {
                id: `CharacterBuilder.${character.id}`,
            }),
        );
        this._character = character;
    }

    private async initialize() {
        // Load all ancestry and culture data
        const [ancestries, cultures, paths] = await Promise.all([
            Promise.all(
                Object.entries(CONFIG.COSMERE.ancestries)
                    .filter(([id, data]) => data.reference)
                    .map(([id, data]) => fromUuid(data.reference!)),
            ),
            Promise.all(
                Object.entries(CONFIG.COSMERE.cultures)
                    .filter(([id, data]) => data.reference)
                    .map(([id, data]) => fromUuid(data.reference!)),
            ),
            Promise.all(
                Object.entries(CONFIG.COSMERE.paths)
                    .filter(
                        ([id, data]) =>
                            data.isStartingPath !== false && data.reference,
                    )
                    .map(([id, data]) => fromUuid(data.reference!)),
            ),
        ]);

        // Get level 1 advancement rule
        const level1Rule = AdvancementUtils.getAdvancementRuleForLevel(1);

        // Get advancement rules for levels > 1
        const advancementRules =
            AdvancementUtils.getAdvancementRulesForLevelChange(
                1,
                this.character.system.level,
            );

        this._steps = [
            {
                id: 'origin',
                label: 'Origin',
                icon: 'fas fa-globe',
                description: "Select your character's ancestry and culture(s).",
                actions: [
                    {
                        label: 'Select Ancestry',
                        icon: 'fas fa-dna',
                        description: `Your ancestry represents the species you are descended from. You can choose from the two most common sapient species on Roshar: humans and singers. Your ancestry guides your appearance, and depending on the capabilities of your species, it may unlock some unique talents.

Your ancestry also grants you one or more bonus talents—you‘ll choose these when you pick your starting path.`,
                        type: 'select-items',
                        max: 1,
                        items: ancestries,
                        selected: () =>
                            [this.character.ancestry]
                                .filter((v) => !!v)
                                .map((i) => i.system.id),
                        onSelect: async (item: CosmereItem) => {
                            // Add new ancestry
                            await this.character.createEmbeddedDocuments(
                                'Item',
                                [item.toObject()],
                                { levelContext: 1 },
                            );
                        },
                    },
                    {
                        label: 'Select Culture',
                        icon: 'fas fa-globe',
                        description:
                            'Every character begins with two cultural expertises to represent the societies in which you were raised or have spent the most time. Cultural expertises determine the languages in which you are most fluent, grant you knowledge of how to navigate those societies, and likely influence your perspective on the world. ',
                        type: 'select-items',
                        max: 2,
                        items: cultures,
                        selected: () =>
                            this.character.cultures.map((i) => i.system.id),
                        onSelect: async (item: CosmereItem) => {
                            // Check if item is already selected
                            const isSelected = this.character.cultures.some(
                                (i) => i.system.id === item.system.id,
                            );

                            if (isSelected) {
                                // Find item id
                                const id = this.character.cultures.find(
                                    (i) => i.system.id === item.system.id,
                                )!.id;

                                // Remove existing culture
                                await this.character.deleteEmbeddedDocuments(
                                    'Item',
                                    [id],
                                    { levelContext: 1 },
                                );
                            } else {
                                // Ensure no more than two cultures are selected
                                if (this.character.cultures.length >= 2) {
                                    return ui.notifications.error(
                                        'You may only select two cultures.',
                                    );
                                }

                                // Add new culture
                                await this.character.createEmbeddedDocuments(
                                    'Item',
                                    [item.toObject()],
                                    { levelContext: 1 },
                                );
                            }
                        },
                    },
                ],
            },
            {
                id: 'path',
                label: 'Starting Path',
                icon: 'fas fa-road',
                description: "Select your character's starting path.",
                actions: [
                    {
                        label: 'Select Path',
                        icon: 'fas fa-road',
                        description: `Player characters gain most of their abilities from paths, reflecting their specialty, training, and experience. Your character‘s chosen paths significantly influence the role you play in the game.

If you‘ve played other roleplaying games, think of paths as more flexible “classes,” with no multiclassing penalties. Instead of linear character progression, your path allows you to pick talents from a tree of options each time you gain a level. Each talent grants you a benefit or ability, representing the specialized capabilities that set you apart from other characters. `,
                        type: 'select-items',
                        max: 1,
                        items: paths,
                        selected: () => {
                            const startingPathId = this.character.getFlag<
                                string | null
                            >(SYSTEM_ID, 'meta.advancement.level1.path');
                            return startingPathId ? [startingPathId] : [];
                        },
                        onSelect: async (item: CosmereItem) => {
                            // Get starting path from meta
                            const startingPathId = this.character.getFlag<
                                string | null
                            >(SYSTEM_ID, 'meta.advancement.level1.path');
                            const startingPath = startingPathId
                                ? this.character.paths.find(
                                      (i) => i.system.id === startingPathId,
                                  )
                                : undefined;

                            // Delete the starting path
                            await startingPath?.delete();

                            // Add new path
                            await this.character.createEmbeddedDocuments(
                                'Item',
                                [item.toObject()],
                                { levelContext: 1 },
                            );

                            // Set starting path flag
                            await this.character.setFlag(
                                SYSTEM_ID,
                                'meta.advancement.level1.path',
                                item.system.id,
                            );
                        },
                    },
                    {
                        label: 'Assign Attributes',
                        icon: 'fas fa-dice-d6',
                        description: `Your character‘s innate characteristics are represented by six attributes: Strength
, Speed
, Intellect
, Willpower
, Awareness
, and Presence
. These form the foundation for your skills, physical and mental potential, and more.
Choose Your Attributes

Most humans and singers have attribute scores ranging from 0 to 3, though remarkable individuals can have even higher scores. The higher your score, the more exceptional you are in that area—and you can increase your attribute scores further when you gain levels.

To choose your scores, distribute 12 points across the six attributes however you want. However, you can‘t put more than 3 points into any attribute during this step of character creation. You don‘t have to put points in every attribute—0 is a valid attribute score.`,
                        type: 'assign-attributes',
                        points: level1Rule.attributePoints ?? 0,
                        maxScore: 3,
                        assigned: () => {
                            // Get configured attributes
                            const attributes = Object.keys(
                                CONFIG.COSMERE.attributes,
                            );

                            // Get assigned attributes from meta
                            const assignedAttributes = attributes
                                .map(
                                    (attributeId) =>
                                        [
                                            attributeId,
                                            this.character.getFlag<
                                                number | null
                                            >(
                                                SYSTEM_ID,
                                                `meta.advancement.level1.attributes.${attributeId}`,
                                            ) ?? 0,
                                        ] as [string, number | null],
                                )
                                .reduce(
                                    (acc, [attributeId, value]) => {
                                        acc[attributeId] = value!;
                                        return acc;
                                    },
                                    {} as Record<string, number>,
                                );

                            return {
                                total: Object.values(assignedAttributes).reduce(
                                    (acc, v) => acc + v,
                                    0,
                                ),
                                scores: assignedAttributes,
                            };
                        },
                        onAssign: async (
                            attribute: Attribute,
                            value: number,
                        ) => {
                            // Get configured attributes
                            const attributes = Object.keys(
                                CONFIG.COSMERE.attributes,
                            );

                            // Get assigned attributes from meta
                            const assignedAttributes = attributes
                                .map(
                                    (attributeId) =>
                                        [
                                            attributeId,
                                            this.character.getFlag<
                                                number | null
                                            >(
                                                SYSTEM_ID,
                                                `meta.advancement.level1.attributes.${attributeId}`,
                                            ) ?? 0,
                                        ] as [string, number | null],
                                )
                                .reduce(
                                    (acc, [attributeId, value]) => {
                                        acc[attributeId] = value!;
                                        return acc;
                                    },
                                    {} as Record<string, number>,
                                );

                            // Get total assigned points
                            const total = Object.values(
                                assignedAttributes,
                            ).reduce((acc, v) => acc + v, 0);

                            // Ensure total points do not exceed max
                            if (
                                total + value >
                                (level1Rule.attributePoints ?? 0)
                            )
                                return;

                            // Get current score
                            const attrScore =
                                assignedAttributes[attribute] ?? 0;

                            // Get new score
                            const newScore = Math.max(
                                0,
                                Math.min(attrScore + value, 3),
                            );

                            // Set new score
                            await this.character.update(
                                {
                                    [`system.attributes.${attribute}.value`]:
                                        this.character.system.attributes[
                                            attribute
                                        ].value -
                                        attrScore +
                                        newScore,
                                    [`flags.${SYSTEM_ID}.meta.advancement.level1.attributes.${attribute}`]:
                                        newScore,
                                },
                                {
                                    levelContext: 1,
                                },
                            );
                        },
                    },
                    {
                        label: 'Assign Skills',
                        icon: 'fas fa-book',
                        description: `The next step is to consider what skills and expertises your character has honed, regardless of their innate attributes.
Choose Your Skills

As you play the game, you‘ll frequently use skills (detailed in the “Skills” section of the Beta Rules Preview) to attempt various tasks.

The more ranks you have in a given skill, the better you are at tests and abilities that use that skill. Each skill is also enhanced by the attribute listed next to it on your character sheet. For example, you‘re more likely to succeed on Insight
tests if you also have high Awareness
.

You can‘t increase any skill above 2 ranks during character creation, but you can otherwise choose them however you wish.

Note that when you pick your starting path in the next step of character creation, you‘ll gain one more skill rank, determined by your choice of path.`,
                        type: 'assign-skills',
                        ranks: level1Rule.skillRanks ?? 0,
                        maxRank: 2,
                        assigned: () => {
                            // Get configured skills
                            const skills = Object.keys(CONFIG.COSMERE.skills);

                            // Get assigned skills from meta
                            const assignedSkills = skills
                                .map(
                                    (skillId) =>
                                        [
                                            skillId,
                                            this.character.getFlag<
                                                number | null
                                            >(
                                                SYSTEM_ID,
                                                `meta.advancement.level1.skills.${skillId}`,
                                            ) ?? 0,
                                        ] as [string, number | null],
                                )
                                .reduce(
                                    (acc, [skillId, value]) => {
                                        acc[skillId] = value!;
                                        return acc;
                                    },
                                    {} as Record<string, number>,
                                );

                            return {
                                total: Object.values(assignedSkills).reduce(
                                    (acc, v) => acc + v,
                                    0,
                                ),
                                ranks: assignedSkills,
                            };
                        },
                        onAssign: async (skill: Skill, value: number) => {
                            // Get configured skills
                            const skills = Object.keys(CONFIG.COSMERE.skills);

                            // Get assigned skills from meta
                            const assignedSkills = skills
                                .map(
                                    (skillId) =>
                                        [
                                            skillId,
                                            this.character.getFlag<
                                                number | null
                                            >(
                                                SYSTEM_ID,
                                                `meta.advancement.level1.skills.${skillId}`,
                                            ) ?? 0,
                                        ] as [string, number | null],
                                )
                                .reduce(
                                    (acc, [skillId, value]) => {
                                        acc[skillId] = value!;
                                        return acc;
                                    },
                                    {} as Record<string, number>,
                                );

                            // Get total assigned points
                            const total = Object.values(assignedSkills).reduce(
                                (acc, v) => acc + v,
                                0,
                            );

                            // Ensure total points do not exceed max
                            if (total + value > (level1Rule.skillRanks ?? 0))
                                return;

                            // Get current rank
                            const skillRank = assignedSkills[skill] ?? 0;

                            // Get new rank
                            const newRank = Math.max(
                                0,
                                Math.min(skillRank + value, 2),
                            );

                            // Set new rank
                            await this.character.update(
                                {
                                    [`system.skills.${skill}.rank`]:
                                        this.character.system.skills[skill]
                                            .rank -
                                        skillRank +
                                        newRank,
                                    [`flags.${SYSTEM_ID}.meta.advancement.level1.skills.${skill}`]:
                                        newRank,
                                },
                                {
                                    levelContext: 1,
                                },
                            );
                        },
                    },
                ],
            },
            {
                id: 'details',
                label: 'Details',
                icon: 'fas fa-info-circle',
                description: "Set your character's details.",
                actions: [
                    {
                        label: 'Select Purpose and Obstacle',
                        icon: 'fas fa-question',
                        description: `Your character‘s purpose is essentially their soul and reason for being. It doesn‘t have specific mechanical effects; rather, their purpose is what drives them, what defines them, and what inspires them to the great actions of your adventures ahead.

Your character‘s obstacle, on the other hand, is what stands in the way of their purpose, time and time again. Each character must contend with their obstacle as they purse their goals and try to realize their purpose.`,
                        type: 'input',
                        inputs: [
                            {
                                label: 'Purpose',
                                value: () => this.character.system.purpose,
                                onChange: async (value: string) => {
                                    await this.character.update({
                                        'system.purpose': value,
                                    });
                                },
                            },
                            {
                                label: 'Obstacle',
                                value: () => this.character.system.obstacle,
                                onChange: async (value: string) => {
                                    await this.character.update({
                                        'system.obstacle': value,
                                    });
                                },
                            },
                        ],
                    },
                    {
                        label: 'Select Goal(s)',
                        icon: 'fas fa-bullseye',
                        description: `You now know who your character was leading up to this moment, and you understand what abilities and experiences shaped them into the person they are today. Now it‘s time to decide where they‘re heading and what they‘re trying to accomplish. These tangible objectives your character is working toward are represented by goals.

As you accomplish your goals, you‘ll unlock rewards that give your character access to some of the most powerful items and people on Roshar. Rewards can include possessions (like fabrials
or Shardplate
), relationships (like traveling companions or patrons), increased status (like noble titles), and more.

Each goal should be something your character is trying to do in the game. These might be as immediate as “escaping imprisonment” or as lofty as “swearing an Ideal of the Knights Radiant.”`,
                        type: 'configure-goals',
                        value: () => {
                            // Get goals from meta
                            const ids =
                                this.character.getFlag<string[]>(
                                    SYSTEM_ID,
                                    'meta.advancement.level1.goals',
                                ) ?? [];
                            return this.character.goals.filter((i) =>
                                ids.includes(i.system.id),
                            );
                        },
                        onChange: async (value: string) => {
                            // Get goals from meta
                            const ids =
                                this.character.getFlag<string[]>(
                                    SYSTEM_ID,
                                    'meta.advancement.level1.goals',
                                ) ?? [];
                            const goals = this.character.goals.filter((i) =>
                                ids.includes(i.system.id),
                            );

                            // Get goal
                            const goal =
                                goals.length > 0 ? goals[0] : undefined;

                            if (goal) {
                                // Update the goal
                                await goal.update({ name: value });
                            } else {
                                // Create the goal
                                const [item] =
                                    (await this.character.createEmbeddedDocuments(
                                        'Item',
                                        [
                                            {
                                                name: value,
                                                type: 'goal',
                                            },
                                        ],
                                    )) as CosmereItem[];

                                // Set the goal flag
                                await this.character.setFlag(
                                    SYSTEM_ID,
                                    'meta.advancement.level1.goals',
                                    [item.system.id],
                                );
                            }
                        },
                    },
                ],
            },

            ...(await Promise.all(
                advancementRules.map(async (rule) => {
                    // Get character state at previous level
                    const characterState =
                        AdvancementUtils.getCharacterStateAtLevel(
                            this.character,
                            rule.level - 1,
                        );

                    console.log('characterState', characterState);

                    // Get ancestry
                    const ancestry = this.character.ancestry;

                    // Get paths
                    const paths = characterState.items.filter((i) =>
                        i.isPath(),
                    );

                    console.log('paths', paths);

                    // Get talent trees
                    const talentTrees = await Promise.all(
                        paths
                            .map((p) => p.system.talentTrees)
                            .flat()
                            .concat(ancestry?.system.talentTrees ?? [])
                            .filter((uuid, i, arr) => arr.indexOf(uuid) === i)
                            .map(
                                async (uuid) =>
                                    (await fromUuid(
                                        uuid,
                                    )) as unknown as TalentTreeItem,
                            ),
                    );

                    console.log('talentTrees', talentTrees);

                    // Get available talents
                    const availableTalents = (
                        await Promise.all(
                            talentTrees.map((tree) =>
                                AdvancementUtils.getAvailableTalentsfromTree(
                                    tree,
                                    characterState,
                                ),
                            ),
                        )
                    ).flat();

                    console.log('availableTalents', availableTalents);

                    return {
                        id: `level-${rule.level}`,
                        label: `Level ${rule.level}`,
                        icon: 'fas fa-level-up-alt',
                        description: `Level ${rule.level} advancement.`,
                        actions: [
                            // Attribute points
                            ...(rule.attributePoints
                                ? [
                                      {
                                          label: 'Assign Attributes',
                                          icon: 'fas fa-dice-d6',
                                          description:
                                              'Assign attribute points.',
                                          type: 'assign-attributes',
                                          points: rule.attributePoints,
                                          assigned: () => {
                                              // Get configured attributes
                                              const attributes = Object.keys(
                                                  CONFIG.COSMERE.attributes,
                                              );

                                              // Get assigned attributes from meta
                                              const assignedAttributes =
                                                  attributes
                                                      .map(
                                                          (attributeId) =>
                                                              [
                                                                  attributeId,
                                                                  this.character.getFlag<
                                                                      | number
                                                                      | null
                                                                  >(
                                                                      SYSTEM_ID,
                                                                      `meta.advancement.level${rule.level}.attributes.${attributeId}`,
                                                                  ) ?? 0,
                                                              ] as [
                                                                  string,
                                                                  number | null,
                                                              ],
                                                      )
                                                      .reduce(
                                                          (
                                                              acc,
                                                              [
                                                                  attributeId,
                                                                  value,
                                                              ],
                                                          ) => {
                                                              acc[attributeId] =
                                                                  value!;
                                                              return acc;
                                                          },
                                                          {} as Record<
                                                              string,
                                                              number
                                                          >,
                                                      );

                                              return {
                                                  total: Object.values(
                                                      assignedAttributes,
                                                  ).reduce(
                                                      (acc, v) => acc + v,
                                                      0,
                                                  ),
                                                  scores: assignedAttributes,
                                              };
                                          },
                                          onAssign: async (
                                              attribute: Attribute,
                                              value: number,
                                          ) => {
                                              // Get configured attributes
                                              const attributes = Object.keys(
                                                  CONFIG.COSMERE.attributes,
                                              );

                                              // Get assigned attributes from meta
                                              const assignedAttributes =
                                                  attributes
                                                      .map(
                                                          (attributeId) =>
                                                              [
                                                                  attributeId,
                                                                  this.character.getFlag<
                                                                      | number
                                                                      | null
                                                                  >(
                                                                      SYSTEM_ID,
                                                                      `meta.advancement.level${rule.level}.attributes.${attributeId}`,
                                                                  ) ?? 0,
                                                              ] as [
                                                                  string,
                                                                  number | null,
                                                              ],
                                                      )
                                                      .reduce(
                                                          (
                                                              acc,
                                                              [
                                                                  attributeId,
                                                                  value,
                                                              ],
                                                          ) => {
                                                              acc[attributeId] =
                                                                  value!;
                                                              return acc;
                                                          },
                                                          {} as Record<
                                                              string,
                                                              number
                                                          >,
                                                      );

                                              // Get total assigned points
                                              const total = Object.values(
                                                  assignedAttributes,
                                              ).reduce((acc, v) => acc + v, 0);

                                              // Ensure total points do not exceed max
                                              if (
                                                  total + value >
                                                  rule.attributePoints!
                                              )
                                                  return;

                                              // Get current score
                                              const attrScore =
                                                  assignedAttributes[
                                                      attribute
                                                  ] ?? 0;

                                              // Get new score
                                              const newScore = Math.max(
                                                  0,
                                                  Math.min(
                                                      attrScore + value,
                                                      3,
                                                  ),
                                              );

                                              // Set new score
                                              await this.character.update({
                                                  [`system.attributes.${attribute}.value`]:
                                                      this.character.system
                                                          .attributes[attribute]
                                                          .value -
                                                      attrScore +
                                                      newScore,
                                                  [`flags.${SYSTEM_ID}.meta.advancement.level${rule.level}.attributes.${attribute}`]:
                                                      newScore,
                                              });
                                          },
                                      },
                                  ]
                                : []),

                            // Skill ranks
                            ...(rule.skillRanks
                                ? [
                                      {
                                          label: 'Assign Skills',
                                          icon: 'fas fa-book',
                                          description: 'Assign skill ranks.',
                                          type: 'assign-skills',
                                          ranks: rule.skillRanks,
                                          assigned: () => {
                                              // Get configured skills
                                              const skills = Object.keys(
                                                  CONFIG.COSMERE.skills,
                                              );

                                              // Get assigned skills from meta
                                              const assignedSkills = skills
                                                  .map(
                                                      (skillId) =>
                                                          [
                                                              skillId,
                                                              this.character.getFlag<
                                                                  number | null
                                                              >(
                                                                  SYSTEM_ID,
                                                                  `meta.advancement.level${rule.level}.skills.${skillId}`,
                                                              ) ?? 0,
                                                          ] as [
                                                              string,
                                                              number | null,
                                                          ],
                                                  )
                                                  .reduce(
                                                      (
                                                          acc,
                                                          [skillId, value],
                                                      ) => {
                                                          acc[skillId] = value!;
                                                          return acc;
                                                      },
                                                      {} as Record<
                                                          string,
                                                          number
                                                      >,
                                                  );

                                              return {
                                                  total: Object.values(
                                                      assignedSkills,
                                                  ).reduce(
                                                      (acc, v) => acc + v,
                                                      0,
                                                  ),
                                                  ranks: assignedSkills,
                                              };
                                          },
                                          onAssign: async (
                                              skill: Skill,
                                              value: number,
                                          ) => {
                                              // Get configured skills
                                              const skills = Object.keys(
                                                  CONFIG.COSMERE.skills,
                                              );

                                              // Get assigned skills from meta
                                              const assignedSkills = skills
                                                  .map(
                                                      (skillId) =>
                                                          [
                                                              skillId,
                                                              this.character.getFlag<
                                                                  number | null
                                                              >(
                                                                  SYSTEM_ID,
                                                                  `meta.advancement.level${rule.level}.skills.${skillId}`,
                                                              ) ?? 0,
                                                          ] as [
                                                              string,
                                                              number | null,
                                                          ],
                                                  )
                                                  .reduce(
                                                      (
                                                          acc,
                                                          [skillId, value],
                                                      ) => {
                                                          acc[skillId] = value!;
                                                          return acc;
                                                      },
                                                      {} as Record<
                                                          string,
                                                          number
                                                      >,
                                                  );

                                              // Get total assigned points
                                              const total = Object.values(
                                                  assignedSkills,
                                              ).reduce((acc, v) => acc + v, 0);

                                              // Ensure total points do not exceed max
                                              if (
                                                  total + value >
                                                  rule.skillRanks!
                                              )
                                                  return;

                                              // Get current rank
                                              const skillRank =
                                                  assignedSkills[skill] ?? 0;

                                              // Get new rank
                                              const newRank = Math.max(
                                                  0,
                                                  Math.min(
                                                      skillRank + value,
                                                      2,
                                                  ),
                                              );

                                              // Set new rank
                                              await this.character.update({
                                                  [`system.skills.${skill}.rank`]:
                                                      this.character.system
                                                          .skills[skill].rank -
                                                      skillRank +
                                                      newRank,
                                                  [`flags.${SYSTEM_ID}.meta.advancement.level${rule.level}.skills.${skill}`]:
                                                      newRank,
                                              });
                                          },
                                      },
                                  ]
                                : []),

                            // Talents
                            ...(rule.talents
                                ? [
                                      {
                                          label: 'Select Talents',
                                          icon: 'fas fa-star',
                                          description: 'Select talents.',
                                          type: 'select-items',
                                          items: availableTalents,
                                          max: rule.talents,
                                          selected: () =>
                                              this.character.getFlag<
                                                  string | null
                                              >(
                                                  SYSTEM_ID,
                                                  `meta.advancement.level${rule.level}.talents`,
                                              ) ?? [],
                                          onSelect: async (
                                              item: CosmereItem,
                                          ) => {
                                              // Get selected
                                              const selected =
                                                  this.character.getFlag<
                                                      string[]
                                                  >(
                                                      SYSTEM_ID,
                                                      `meta.advancement.level${rule.level}.talents`,
                                                  ) ?? [];

                                              // Check if item is already selected
                                              const isSelected =
                                                  selected.includes(
                                                      item.system.id,
                                                  );

                                              if (isSelected) {
                                                  // Find talent item
                                                  const talent =
                                                      this.character.talents.find(
                                                          (i) =>
                                                              i.system.id ===
                                                              item.system.id,
                                                      );

                                                  // Remove existing talent
                                                  await this.character.deleteEmbeddedDocuments(
                                                      'Item',
                                                      [talent!.id],
                                                      {
                                                          levelContext:
                                                              rule.level,
                                                      },
                                                  );

                                                  // Remove existing talent
                                                  await this.character.setFlag(
                                                      SYSTEM_ID,
                                                      `meta.advancement.level${rule.level}.talents`,
                                                      selected.filter(
                                                          (i) =>
                                                              i !==
                                                              item.system.id,
                                                      ),
                                                  );
                                              } else {
                                                  if (
                                                      selected.length >=
                                                      rule.talents!
                                                  ) {
                                                      // Replace first talent
                                                      const [first] = selected;

                                                      // Find talent item
                                                      const talent =
                                                          this.character.talents.find(
                                                              (i) =>
                                                                  i.system
                                                                      .id ===
                                                                  first,
                                                          );

                                                      // Remove existing talent
                                                      await this.character.deleteEmbeddedDocuments(
                                                          'Item',
                                                          [talent!.id],
                                                          {
                                                              levelContext:
                                                                  rule.level,
                                                          },
                                                      );

                                                      selected.shift();

                                                      // Remove existing talent
                                                      await this.character.setFlag(
                                                          SYSTEM_ID,
                                                          `meta.advancement.level${rule.level}.talents`,
                                                          [
                                                              selected,
                                                              item.system.id,
                                                          ],
                                                      );
                                                  }

                                                  // Add new talent
                                                  await this.character.createEmbeddedDocuments(
                                                      'Item',
                                                      [item.toObject()],
                                                      {
                                                          levelContext:
                                                              rule.level,
                                                      },
                                                  );

                                                  // Set the talent flag
                                                  await this.character.setFlag(
                                                      SYSTEM_ID,
                                                      `meta.advancement.level${rule.level}.talents`,
                                                      [
                                                          ...selected,
                                                          item.system.id,
                                                      ],
                                                  );
                                              }
                                          },
                                      },
                                  ]
                                : []),
                        ],
                    };
                }),
            )),
        ];

        // Set initalized flag
        this.initalized = true;
    }

    /* --- Statics --- */

    public static show(character: CharacterActor) {
        const builder = new CharacterBuilder(character);
        void builder.render(true);
    }

    /* --- Accessors --- */

    public get character(): CharacterActor {
        return this._character;
    }

    public get steps(): any[] {
        return this._steps;
    }

    /* --- Actions --- */

    private static _onCloseClick(this: CharacterBuilder) {
        void this.close();
    }

    private static async _onSelectItem(this: CharacterBuilder, event: Event) {
        event.preventDefault();

        // Get the action index
        const actionIndex = Number(
            $(event.target!).closest('.action').data('index'),
        );

        // Get the step
        const step = this.steps[this.currentStep];

        // Get the action
        const action = step.actions[actionIndex];

        // Get the item UUID from the event
        const uuid = $(event.target!).closest('.item').data('uuid') as string;

        // Load the item
        const item = (await fromUuid(uuid)) as unknown as
            | CosmereItem
            | undefined;
        if (!item) return;

        // Perform the action
        if (action.onSelect) {
            await action.onSelect(item);
            await this.render();
        }

        // Check if the item has a description
        if (!item.hasDescription() || !item.system.description?.value) return;

        // Enrich the description
        const enriched = await TextEditor.enrichHTML(
            item.system.description.value,
        );

        // Get details section element
        const details = $(this.element).find('section.details');

        // Clear existing details
        details.empty();

        // Render the item details
        details.append(`
            <h1>${item.name}</h1>
            ${enriched}    
        `);
    }

    private static async _onAssignAttribute(
        this: CharacterBuilder,
        event: Event,
    ) {
        event.preventDefault();

        // Get the action index
        const actionIndex = Number(
            $(event.target!).closest('.action').data('index'),
        );

        // Get the step
        const step = this.steps[this.currentStep];

        // Get the action
        const action = step.actions[actionIndex];

        // Get the attribute ID from the event
        const attributeId = $(event.target!)
            .closest('.attribute')
            .data('id') as Attribute;

        // Get the value from the event
        const value = Number(
            $(event.target!).closest('[data-value]').data('value'),
        );

        // Perform the action
        if (action.onAssign) {
            await action.onAssign(attributeId, value);
            await this.render();
        }
    }

    private static async _onAssignSkill(this: CharacterBuilder, event: Event) {
        event.preventDefault();

        // Get the action index
        const actionIndex = Number(
            $(event.target!).closest('.action').data('index'),
        );

        // Get the step
        const step = this.steps[this.currentStep];

        // Get the action
        const action = step.actions[actionIndex];

        // Get the skill ID from the event
        const skillId = $(event.target!).closest('.skill').data('id') as Skill;

        // Get the value from the event
        const value = Number(
            $(event.target!).closest('[data-value]').data('value'),
        );

        // Perform the action
        if (action.onAssign) {
            await action.onAssign(skillId, value);
            await this.render();
        }
    }

    private static async _onSelectStep(this: CharacterBuilder, event: Event) {
        event.preventDefault();

        // Get the step index
        const stepIndex = Number(
            $(event.target!).closest('.step').data('index'),
        );

        // Set the current step
        this.currentStep = stepIndex;

        // Render the application
        await this.render();
    }

    /* --- Lifecycle --- */

    protected override _onRender(context: AnyObject, options: AnyObject): void {
        super._onRender(context, options);

        $(this.element)
            .find('.action[data-type="configure-goals"] input')
            .on('change', async (event) => {
                // Get the action index
                const actionIndex = Number(
                    $(event.target).closest('.action').data('index'),
                );

                // Get the step
                const step = this.steps[this.currentStep];

                // Get the action
                const action = step.actions[actionIndex];

                // Get the value
                const value = $(event.target).val();

                // Perform the action
                if (action.onChange) {
                    await action.onChange(value);
                }
            });

        $(this.element)
            .find('.action[data-type="input"] input')
            .on('change', async (event) => {
                // Get the action index
                const actionIndex = Number(
                    $(event.target).closest('.action').data('index'),
                );

                // Get the step
                const step = this.steps[this.currentStep];

                // Get the action
                const action = step.actions[actionIndex];

                // Get the input
                const inputIndex = Number(
                    $(event.target).closest('.input-field').data('index'),
                );
                const input = action.inputs[inputIndex];

                // Get the value
                const value = $(event.target).val();

                // Perform the action
                if (input.onChange) {
                    await input.onChange(value);
                }
            });
    }

    protected override _onPosition(options: AnyObject): void {
        super._onPosition(options);

        // Force the application to fill the entire window
        $(this.element).css('width', '100%').css('height', '100%');
    }

    protected override _onClose(options: AnyObject): void {
        super._onClose(options);

        // Clear initalized flag
        this.initalized = false;
    }

    /* --- Context --- */

    protected override async _prepareContext(options: unknown) {
        if (!this.initalized) await this.initialize();

        return {
            character: this.character,
            steps: this.prepareSteps(),
            currentStep: this.currentStep,

            // CONFIG
            ATTRIBUTE_GROUPS: Object.entries(
                CONFIG.COSMERE.attributeGroups,
            ).map(([id, data]) => ({
                id,
                ...data,
                skills: Object.entries(CONFIG.COSMERE.skills)
                    .filter(([_, skill]) =>
                        data.attributes.includes(skill.attribute),
                    )
                    .map(([id, data]) => ({
                        id,
                        ...data,
                        core: !!data.core,
                        attributeLabel:
                            CONFIG.COSMERE.attributes[data.attribute]
                                .labelShort,
                    })),
            })),
            ATTRIBUTES: Object.entries(CONFIG.COSMERE.attributes).map(
                ([id, data]) => ({ id, ...data }),
            ),
        };
    }

    protected prepareSteps() {
        return this.steps.map((step, i) => {
            return {
                ...step,
                css: i === this.currentStep ? 'active' : '',
                actions: step.actions.map((action: any) => {
                    if (action.type === 'select-items') {
                        return {
                            ...action,
                            selected: action.selected(),
                        };
                    } else if (
                        action.type === 'assign-attributes' ||
                        action.type === 'assign-skills'
                    ) {
                        return {
                            ...action,
                            assigned: action.assigned(),
                        };
                    } else if (action.type === 'input') {
                        return {
                            ...action,
                            inputs: action.inputs.map((input: any) => ({
                                ...input,
                                value: input.value(),
                            })),
                        };
                    } else {
                        return action;
                    }
                }),
            };
        });
    }
}

/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
