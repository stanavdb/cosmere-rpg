import {
  Attribute,
  Resource,
  AttributeGroup,
  Skill,
  ExpertiseType,
  DeflectSource,
  ItemType,
  DamageType,
  Condition,
} from "@system/types/cosmere";
import { CosmereActor } from "@system/documents/actor";
import { CosmereItem } from "@system/documents";
import { ArmorItemDataModel } from "@system/data/item/armor";

// Fields
import { DerivedValueField, Derived } from "../fields/derived-value-field";

interface DeflectData {
  value: number;
  source?: DeflectSource;
}

interface ExpertiseData {
  type: ExpertiseType;
  id: string;
  label: string;
}

export interface CommonActorData {
  senses: {
    range: Derived<number>;
    obscuredAffected: Derived<boolean>;
  };
  immunities: {
    damage: DamageType[];
    condition: Condition[];
  };
  attributes: Record<Attribute, { value: number }>;
  defenses: Record<AttributeGroup, { value: Derived<number>; bonus: number }>;
  resources: Record<
    Resource,
    {
      value: number;
      max: Derived<number>;
      bonus: number;
      deflect?: DeflectData;
    }
  >;
  skills: Record<
    Skill,
    { attribute: Attribute; rank: number; mod: Derived<number> }
  >;
  movement: {
    rate: Derived<number>;
  };
  encumbrance: {
    lift: Derived<number>;
    carry: Derived<number>;
  };
  expertises?: ExpertiseData[];
  languages?: string[];
}

export class CommonActorDataModel<
  Schema extends CommonActorData = CommonActorData,
> extends foundry.abstract.TypeDataModel<Schema, CosmereActor> {
  static defineSchema() {
    return {
      senses: new foundry.data.fields.SchemaField({
        range: new DerivedValueField(
          new foundry.data.fields.NumberField({
            required: true,
            nullable: false,
            integer: true,
            min: 0,
            initial: 5,
          }),
        ),
        obscuredAffected: new DerivedValueField(
          new foundry.data.fields.BooleanField({
            required: true,
            nullable: false,
            initial: true,
          }),
        ),
      }),
      immunities: new foundry.data.fields.SchemaField({
        damage: new foundry.data.fields.ArrayField(
          new foundry.data.fields.StringField({
            nullable: false,
            blank: false,
            choices: Object.keys(CONFIG.COSMERE.damageTypes),
          }),
        ),
        conditions: new foundry.data.fields.ArrayField(
          new foundry.data.fields.StringField({
            nullable: false,
            blank: false,
            choices: Object.keys(CONFIG.COSMERE.conditions),
          }),
        ),
      }),
      attributes: this.getAttributesSchema(),
      defenses: this.getDefensesSchema(),
      resources: this.getResourcesSchema(),
      skills: this.getSkillsSchema(),
      movement: new foundry.data.fields.SchemaField({
        rate: new DerivedValueField(
          new foundry.data.fields.NumberField({
            required: true,
            nullable: false,
            integer: true,
            min: 0,
            initial: 0,
          }),
        ),
      }),
      encumbrance: new foundry.data.fields.SchemaField({
        lift: new DerivedValueField(
          new foundry.data.fields.NumberField({
            required: true,
            nullable: false,
            integer: true,
            min: 0,
            initial: 0,
          }),
        ),
        carry: new DerivedValueField(
          new foundry.data.fields.NumberField({
            required: true,
            nullable: false,
            integer: true,
            min: 0,
            initial: 0,
          }),
        ),
      }),
      expertises: new foundry.data.fields.ArrayField(
        new foundry.data.fields.SchemaField({
          type: new foundry.data.fields.StringField({
            required: true,
            nullable: false,
            blank: false,
            initial: ExpertiseType.Cultural,
            choices: Object.keys(CONFIG.COSMERE.expertiseTypes),
          }),
          id: new foundry.data.fields.StringField({
            required: true,
            nullable: false,
            blank: false,
          }),
          label: new foundry.data.fields.StringField({
            required: true,
            nullable: false,
            blank: false,
          }),
        }),
      ),
      languages: new foundry.data.fields.ArrayField(
        new foundry.data.fields.StringField(),
      ),
    };
  }

  private static getAttributesSchema() {
    const attributes = CONFIG.COSMERE.attributes;

    return new foundry.data.fields.SchemaField(
      Object.keys(attributes).reduce(
        (schemas, key) => {
          schemas[key] = new foundry.data.fields.SchemaField({
            value: new foundry.data.fields.NumberField({
              required: true,
              nullable: false,
              integer: true,
              min: 0,
              max: 5,
              initial: 0,
            }),
          });

          return schemas;
        },
        {} as Record<string, foundry.data.fields.SchemaField>,
      ),
    );
  }

  private static getDefensesSchema() {
    const defenses = CONFIG.COSMERE.attributeGroups;

    return new foundry.data.fields.SchemaField(
      Object.keys(defenses).reduce(
        (schemas, key) => {
          schemas[key] = new foundry.data.fields.SchemaField({
            value: new DerivedValueField(
              new foundry.data.fields.NumberField({
                required: true,
                nullable: false,
                integer: true,
                min: 0,
                max: 5,
                initial: 0,
              }),
            ),
            bonus: new foundry.data.fields.NumberField({
              required: true,
              nullable: false,
              integer: true,
              initial: 0,
            }),
          });

          return schemas;
        },
        {} as Record<string, foundry.data.fields.SchemaField>,
      ),
    );
  }

  private static getResourcesSchema() {
    const resources = CONFIG.COSMERE.resources;

    return new foundry.data.fields.SchemaField(
      Object.keys(resources).reduce(
        (schemas, key) => {
          const resource = resources[key as Resource];

          schemas[key] = new foundry.data.fields.SchemaField({
            value: new foundry.data.fields.NumberField({
              required: true,
              nullable: false,
              integer: true,
              min: 0,
              initial: 0,
            }),
            max: new DerivedValueField(
              new foundry.data.fields.NumberField({
                required: true,
                nullable: false,
                integer: true,
                min: 0,
                initial: 0,
              }),
            ),
            bonus: new foundry.data.fields.NumberField({
              required: true,
              nullable: false,
              integer: true,
              initial: 0,
            }),

            ...(resource.deflect
              ? {
                  deflect: new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                      required: true,
                      nullable: false,
                      integer: true,
                      min: 0,
                      initial: 0,
                    }),
                    source: new foundry.data.fields.StringField({
                      initial: DeflectSource.Armor,
                      choices: Object.keys(CONFIG.COSMERE.deflect.sources),
                    }),
                  }),
                }
              : {}),
          });

          return schemas;
        },
        {} as Record<string, foundry.data.fields.SchemaField>,
      ),
    );
  }

  private static getSkillsSchema() {
    const skills = CONFIG.COSMERE.skills;

    return new foundry.data.fields.SchemaField(
      (Object.keys(skills) as Skill[]).reduce(
        (schemas, key) => {
          schemas[key] = new foundry.data.fields.SchemaField({
            attribute: new foundry.data.fields.StringField({
              required: true,
              nullable: false,
              blank: false,
              initial: skills[key].attribute,
            }),
            rank: new foundry.data.fields.NumberField({
              required: true,
              nullable: false,
              integer: true,
              min: 0,
              max: 5,
              initial: 0,
            }),
            mod: new DerivedValueField(
              new foundry.data.fields.NumberField({
                required: true,
                nullable: false,
                integer: true,
                min: 0,
                initial: 0,
              }),
            ),
          });

          return schemas;
        },
        {} as Record<string, foundry.data.fields.SchemaField>,
      ),
    );
  }

  public prepareDerivedData(): void {
    super.prepareDerivedData();

    this.senses.range.value = awarenessToSensesRange(this.attributes.awa.value);
    this.senses.obscuredAffected.value = this.attributes.awa.value < 9;

    // Derive defenses
    (Object.keys(this.defenses) as AttributeGroup[]).forEach((group) => {
      // Get bonus
      const bonus = this.defenses[group].bonus;

      // Get attributes
      const attrs = CONFIG.COSMERE.attributeGroups[group].attributes;

      // Get attribute values
      const attrValues = attrs.map((key) => this.attributes[key].value);

      // Sum attribute values
      const attrsSum = attrValues.reduce((sum, v) => sum + v, 0);

      // Assign defense
      this.defenses[group].value.value = 10 + attrsSum + bonus;
    });

    // Derive resource max
    (Object.keys(this.resources) as Resource[]).forEach((key) => {
      // Get the resource
      const resource = this.resources[key];

      if (key === Resource.Health) {
        // Get strength value
        const strength = this.attributes.str.value;

        // Assign max
        resource.max.value = 10 + strength + resource.bonus;
      } else if (key === Resource.Focus) {
        // Get willpower value
        const willpower = this.attributes.wil.value;

        // Assign max
        resource.max.value = 2 + willpower + resource.bonus;
      }

      if (CONFIG.COSMERE.resources[key].deflect) {
        // Get deflect source, defaulting to armor
        const source = resource.deflect?.source ?? DeflectSource.Armor;

        if (source === DeflectSource.Armor) {
          // Find equipped armor
          const armor = this.parent.items
            .filter((item) => item.type === ItemType.Armor)
            .map((item) => item as unknown as CosmereItem<ArmorItemDataModel>)
            .find((item) => item.system.equipped);

          // Derive deflect
          resource.deflect!.value = armor?.system.deflect ?? 0;
        }
      }

      // Get max
      const max = Derived.getValue(resource.max)!;

      // Ensure resource value is between max mand min
      resource.value = Math.max(0, Math.min(max, resource.value));
    });

    // Derive skill modifiers
    (Object.keys(this.skills) as Skill[]).forEach((skill) => {
      // Get the skill config
      const skillConfig = CONFIG.COSMERE.skills[skill];

      // Get the attribute associated with this skill
      const attribute = skillConfig.attribute;

      // Get skill rank
      const rank = this.skills[skill].rank;

      // Get attribute value
      const attrValue = this.attributes[attribute].value;

      // Calculate mod
      this.skills[skill].mod.value = attrValue + rank;
    });

    // Movement
    this.movement.rate.value = speedToMovementRate(this.attributes.spd.value);

    // Lifting & Carrying
    this.encumbrance.lift.value = strengthToLiftingCapacity(
      this.attributes.str.value,
    );
    this.encumbrance.carry.value = strengthToCarryingCapacity(
      this.attributes.str.value,
    );
  }
}

const SENSES_RANGES = [5, 10, 20, 50, 100, Number.MAX_VALUE];
function awarenessToSensesRange(awareness: number) {
  return SENSES_RANGES[
    Math.min(Math.ceil(awareness / 2), SENSES_RANGES.length)
  ];
}

const MOVEMENT_RATES = [20, 25, 30, 40, 60, 80];
function speedToMovementRate(speed: number) {
  return MOVEMENT_RATES[Math.min(Math.ceil(speed / 2), MOVEMENT_RATES.length)];
}

const LIFTING_CAPACITIES = [100, 200, 500, 1000, 5000, 10000];
function strengthToLiftingCapacity(strength: number) {
  return LIFTING_CAPACITIES[
    Math.min(Math.ceil(strength / 2), LIFTING_CAPACITIES.length)
  ];
}

const CARRYING_CAPACITIES = [50, 100, 250, 500, 2500, 5000];
function strengthToCarryingCapacity(strength: number) {
  return CARRYING_CAPACITIES[
    Math.min(Math.ceil(strength / 2), CARRYING_CAPACITIES.length)
  ];
}
