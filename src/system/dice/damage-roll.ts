import { DamageType } from '@system/types/cosmere';
import { AdvantageMode } from '@system/types/roll';

// NOTE: Need to use type instead of interface here,
// as the generic of Roll doesn't handle interfaces properly
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type DamageRollData = {
    mod: number;
};

export interface DamageRollOptions extends Partial<RollTerm.EvaluationOptions> {
    /**
     * What advantage modifier to apply to the damage roll
     * @default AdvantageMode.None
     */
    advantageMode?: AdvantageMode;
}

export class DamageRoll extends Roll<DamageRollData> {
    public readonly isDamage = true;

    public constructor(
        formula: string,
        public readonly damageType: DamageType | undefined,
        data: DamageRollData,
        options: DamageRollOptions = {},
    ) {
        super(formula, data, options);
    }
}
