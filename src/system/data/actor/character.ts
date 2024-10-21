import { CommonActorDataModel, CommonActorData } from './common';

// Fields
import { DerivedValueField, Derived, MappingField } from '../fields';

interface GoalData {
    text: string;
    level: number;
}

interface ConnectionData {
    name: string;
    description: string;
}

export interface CharacterActorData extends CommonActorData {
    level: {
        paths: Record<string, number>;
        total: Derived<number>;
    };
    recovery: { die: Derived<string> };

    /* --- Goals, Connections, Purpose, and Obstacle --- */
    purpose: string;
    obstacle: string;
    goals: GoalData[];
    connections: ConnectionData[];
}

export class CharacterActorDataModel extends CommonActorDataModel<CharacterActorData> {
    public static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            level: new foundry.data.fields.SchemaField({
                paths: new MappingField(
                    new foundry.data.fields.NumberField({
                        integer: true,
                        min: 0,
                    }),
                    {
                        required: true,
                        nullable: false,
                    },
                ),
                total: new DerivedValueField(
                    new foundry.data.fields.NumberField({
                        min: 0,
                        integer: true,
                    }),
                ),
            }),

            recovery: new foundry.data.fields.SchemaField({
                die: new DerivedValueField(
                    new foundry.data.fields.StringField({
                        required: true,
                        blank: false,
                        initial: 'd4',
                        choices: RECOVERY_DICE,
                    }),
                ),
            }),

            /* --- Goals, Connections, Purpose, and Obstacle --- */
            goals: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField({
                    text: new foundry.data.fields.StringField({
                        required: true,
                    }),
                    level: new foundry.data.fields.NumberField({
                        required: true,
                        integer: true,
                        initial: 0,
                        min: 0,
                        max: 3,
                    }),
                }),
                {
                    required: true,
                    nullable: false,
                    initial: [],
                },
            ),
            connections: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField({
                    name: new foundry.data.fields.StringField({
                        required: true,
                    }),
                    description: new foundry.data.fields.HTMLField({
                        required: true,
                    }),
                }),
                {
                    required: true,
                    nullable: false,
                    initial: [],
                },
            ),
            purpose: new foundry.data.fields.HTMLField({
                required: true,
                initial: '',
            }),
            obstacle: new foundry.data.fields.HTMLField({
                required: true,
                initial: '',
            }),
        });
    }

    public prepareDerivedData() {
        super.prepareDerivedData();

        this.level.total.value = Object.values(this.level.paths).reduce(
            (sum, lvl) => sum + lvl,
            0,
        );

        this.recovery.die.value = willpowerToRecoveryDie(
            this.attributes.wil.value,
        );
    }
}

export const RECOVERY_DICE = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
function willpowerToRecoveryDie(willpower: number) {
    return RECOVERY_DICE[
        Math.min(Math.ceil(willpower / 2), RECOVERY_DICE.length)
    ];
}
