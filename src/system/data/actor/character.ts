import { CommonActorDataModel, CommonActorData } from './common';

export interface CharacterActorData extends CommonActorData {
    recovery: { die: string; }
}

export class CharacterActorDataModel extends CommonActorDataModel {
    public static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            recovery: new foundry.data.fields.SchemaField({
                die: new foundry.data.fields.StringField({
                    required: true, nullable: false, blank: false, initial: 'd4'
                })
            })
        });
    }

    public prepareDerivedData() {
        super.prepareDerivedData();

        const system = this as any as CharacterActorData;

        system.recovery.die = willpowerToRecoveryDie(system.attributes.wil.value);
    }
}

const RECOVERY_DICE = [ 'd4', 'd6', 'd8', 'd10', 'd12', 'd20' ];
function willpowerToRecoveryDie(willpower: number) {
    return RECOVERY_DICE[Math.min(Math.ceil(willpower / 2), RECOVERY_DICE.length)]
}