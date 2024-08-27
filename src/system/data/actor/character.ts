import { CommonActorDataModel, CommonActorData } from './common';

// Fields
import { DerivedValueField, Derived, MappingField } from '../fields';

export interface CharacterActorData extends CommonActorData {
    level: {
        paths: Record<string, number>;
        total: Derived<number>;
    };
    recovery: { die: Derived<string> };
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
                        nullable: false,
                        blank: false,
                        initial: 'd4',
                        choices: RECOVERY_DICE,
                    }),
                ),
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

const RECOVERY_DICE = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
function willpowerToRecoveryDie(willpower: number) {
    return RECOVERY_DICE[
        Math.min(Math.ceil(willpower / 2), RECOVERY_DICE.length)
    ];
}
