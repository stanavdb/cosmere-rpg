import { CommonActorDataModel, CommonActorData } from "./common";

export interface CharacterActorData extends CommonActorData {
  recovery: { die: string };
}

// NOTE: Empty interface is used to merge definitions here,
// which is used to merge schema properties onto data model
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging
export interface CharacterActorDataModel extends CharacterActorData {}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class CharacterActorDataModel extends CommonActorDataModel {
  public static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      recovery: new foundry.data.fields.SchemaField({
        die: new foundry.data.fields.StringField({
          required: true,
          nullable: false,
          blank: false,
          initial: "d4",
        }),
      }),
    });
  }

  public prepareDerivedData() {
    super.prepareDerivedData();

    this.recovery.die = willpowerToRecoveryDie(this.attributes.wil.value);
  }
}

const RECOVERY_DICE = ["d4", "d6", "d8", "d10", "d12", "d20"];
function willpowerToRecoveryDie(willpower: number) {
  return RECOVERY_DICE[
    Math.min(Math.ceil(willpower / 2), RECOVERY_DICE.length)
  ];
}
