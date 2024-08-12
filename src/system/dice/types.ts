export interface RollToMessageOptions {
  rollMode?: keyof CONFIG.Dice.RollModes | "roll";
  create?: boolean;
}

export type RollMode = keyof CONFIG.Dice.RollModes | "roll";
