import { CharacterActor } from "@system/documents/actor";
import { Derived } from "@system/data/fields";

Handlebars.registerHelper(
  "greaterThan",
  (a: number, b: number, equal?: boolean) => (equal ? a >= b : a > b),
);

Handlebars.registerHelper(
  "expertisesList",
  (actor: CharacterActor, defaultValue = "-"): string => {
    if (!actor.system.expertises?.length) return defaultValue;
    return actor.system.expertises
      .map(
        (expertise) =>
          `${expertise.label} (${CONFIG.COSMERE.expertiseTypes[expertise.type].label})`,
      )
      .join(", ");
  },
);

Handlebars.registerHelper("derived", (derived: Derived<string | number>) => {
  return Derived.getValue(derived);
});
