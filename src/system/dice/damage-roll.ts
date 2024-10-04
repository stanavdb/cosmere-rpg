import { DamageType } from '@system/types/cosmere';
import { CosmereActorRollData } from '@system/documents/actor';
import { AdvantageMode } from '@system/types/roll';

export interface DamageRollOptions
    extends Partial<foundry.dice.terms.RollTerm.EvaluationOptions> {
    /**
     * The type of damage being rolled
     */
    damageType?: DamageType;

    /**
     * The damage modifier to apply on hit
     */
    mod: number;

    /**
     * What advantage modifier to apply to the damage roll
     * @default AdvantageMode.None
     */
    advantageMode?: AdvantageMode;
}

export class DamageRoll extends foundry.dice.Roll<CosmereActorRollData> {
    public readonly isDamage = true;

    declare options: DamageRollOptions;

    public constructor(
        formula: string,
        data: CosmereActorRollData,
        options: DamageRollOptions,
    ) {
        super(formula, data, options);
    }

    get damageType(): DamageType | undefined {
        return this.options.damageType;
    }

    get mod(): number {
        return this.options.mod;
    }
}
