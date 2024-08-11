import { 
    Attribute, 
    Resource, 
    AttributeGroup, 
    Skill,
    ExpertiseType,
} from '@system/types/cosmere';

interface ExpertiseData {
    type: ExpertiseType;
    id: string;
    label: string;
}

export interface CommonActorData {
    senses: { range: number; obscuredAffected: boolean; }
    attributes: Record<Attribute, { value: number }>;
    defenses: Record<AttributeGroup, { value: number; bonus: number; }>;
    resources: Record<Resource, { value: number; max: number; bonus: number; deflect?: number }>;
    skills: Record<Skill, { attribute: Attribute; rank: number; mod: number; }>;
    movement: {
        rate: number;
    };
    encumbrance: {
        lift: number;
        carry: number;
    };
    expertises: ExpertiseData[];
}

// NOTE: Empty interface is used to merge definitions here,
// which is used to merge schema properties onto data model
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging
export interface CommonActorDataModel extends CommonActorData {};
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class CommonActorDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            senses: new foundry.data.fields.SchemaField({
                range: new foundry.data.fields.NumberField({
                    required: true, nullable: false, integer: true, min: 0, initial: 5,
                }),
                obscuredAffected: new foundry.data.fields.BooleanField({
                    required: true, nullable: false, initial: false
                })
            }),
            attributes: this.getAttributesSchema(),
            defenses: this.getDefensesSchema(),
            resources: this.getResourcesSchema(),
            skills: this.getSkillsSchema(),
            movement: new foundry.data.fields.SchemaField({
                rate: new foundry.data.fields.NumberField({
                    required: true, nullable: false, integer: true, min: 0, initial: 0
                }),
            }),
            encumbrance: new foundry.data.fields.SchemaField({
                lift: new foundry.data.fields.NumberField({
                    required: true, nullable: false, integer: true, min: 0, initial: 0
                }),
                carry: new foundry.data.fields.NumberField({
                    required: true, nullable: false, integer: true, min: 0, initial: 0
                }),
            }),
            expertises: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField({
                    type: new foundry.data.fields.StringField({
                        required: true, 
                        nullable: false, 
                        blank: false, 
                        initial: ExpertiseType.Cultural,
                        choices: Object.keys(CONFIG.COSMERE.expertiseTypes)
                    }),
                    id: new foundry.data.fields.StringField({
                        required: true, nullable: false, blank: false
                    }),
                    label: new foundry.data.fields.StringField({
                        required: true, nullable: false, blank: false
                    })
                })
            )
        }
    }

    private static getAttributesSchema() {
        const attributes = CONFIG.COSMERE.attributes;

        return new foundry.data.fields.SchemaField(
            Object.keys(attributes)
            .reduce((schemas, key) => {
                schemas[key] = new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                        required: true, nullable: false, integer: true, min: 0, max: 5, initial: 0,
                    })
                });

                return schemas;
            }, {} as Record<string, foundry.data.fields.SchemaField>)
        );
    }

    private static getDefensesSchema() {
        const defenses = CONFIG.COSMERE.attributeGroups;

        return new foundry.data.fields.SchemaField(
            Object.keys(defenses)
            .reduce((schemas, key) => {
                schemas[key] = new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                        required: true, nullable: false, integer: true, min: 0, max: 5, initial: 0,
                    }),
                    bonus: new foundry.data.fields.NumberField({
                        required: true, nullable: false, integer: true, initial: 0,
                    }),
                });

                return schemas;
            }, {} as Record<string, foundry.data.fields.SchemaField>)
        ); 
    }

    private static getResourcesSchema() {
        const resources = CONFIG.COSMERE.resources;

        return new foundry.data.fields.SchemaField(
            Object.keys(resources)
            .reduce((schemas, key) => {
                const resource = resources[key as unknown as Resource];

                schemas[key] = new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                        required: true, nullable: false, integer: true, min: 0, initial: 0,
                    }),
                    max: new foundry.data.fields.NumberField({
                        required: true, nullable: false, integer: true, min: 0, initial: 0,
                    }),
                    bonus: new foundry.data.fields.NumberField({
                        required: true, nullable: false, integer: true, initial: 0,
                    }),

                    ...(
                        resource.deflect ? 
                            {
                                deflect: new foundry.data.fields.NumberField({
                                    required: true, nullable: false, integer: true, min: 0, initial: 0
                                })
                            } : {}
                    )
                });

                return schemas;
            }, {} as Record<string, foundry.data.fields.SchemaField>)
        );  
    }

    private static getSkillsSchema() {
        const skills = CONFIG.COSMERE.skills;

        return new foundry.data.fields.SchemaField(
            Object.keys(skills)
            .reduce((schemas, key) => {
                schemas[key] = new foundry.data.fields.SchemaField({
                    attribute: new foundry.data.fields.StringField({
                        required: true, nullable: false, blank: false, initial: skills[key as unknown as Skill].attribute
                    }),
                    rank: new foundry.data.fields.NumberField({
                        required: true, nullable: false, integer: true, min: 0, max: 5, initial: 0,
                    }),
                    mod: new foundry.data.fields.NumberField({
                        required: true, nullable: false, integer: true, min: 0, initial: 0,
                    })
                });

                return schemas;
            }, {} as Record<string, foundry.data.fields.SchemaField>)
        );
    }

    public prepareDerivedData(): void {
        super.prepareDerivedData();

        this.senses.range = awarenessToSensesRange(this.attributes.awa.value);
        this.senses.obscuredAffected = this.attributes.awa.value < 9;

        // Derive defenses
        (Object.keys(this.defenses) as unknown as AttributeGroup[])
            .forEach(group => {
                // Get bonus
                const bonus = this.defenses[group].bonus;

                // Get attributes
                const attrs = CONFIG.COSMERE.attributeGroups[group].attributes;

                // Get attribute values
                const attrValues = attrs.map(
                    key => this.attributes[key].value
                );

                // Sum attribute values
                const attrsSum = attrValues.reduce((sum, v) => sum + v, 0);

                // Assign defense
                this.defenses[group].value = 10 + attrsSum + bonus;
            });

        // Derive resource max
        (Object.keys(this.resources) as unknown as Resource[])
            .forEach(key => {
                // Get the resource
                const resource = this.resources[key];

                if (key === Resource.Health) {
                    // Get strength value
                    const strength = this.attributes.str.value;
                    
                    // Assign max
                    resource.max = 10 + strength + resource.bonus;
                } else if (key === Resource.Focus) {
                    // Get willpower value
                    const willpower = this.attributes.wil.value;

                    // Assign max
                    resource.max = 2 + willpower + resource.bonus;
                }

                // Ensure resource value is between max and min
                resource.value = Math.max(0, Math.min(resource.max, resource.value));
            });

        // Derive skill modifiers
        (Object.keys(this.skills) as unknown as Skill[])
            .forEach(skill => {
                // Get the skill config
                const skillConfig = CONFIG.COSMERE.skills[skill];

                // Get the attribute associated with this skill
                const attribute = skillConfig.attribute;

                // Get skill rank
                const rank = this.skills[skill].rank;

                // Get attribute value
                const attrValue = this.attributes[attribute].value;

                // Calculate mod
                this.skills[skill].mod = attrValue + rank;
            });

        // Movement
        this.movement.rate = speedToMovementRate(this.attributes.spd.value);

        // Lifting & Carrying
        this.encumbrance.lift = strengthToLiftingCapacity(this.attributes.str.value);
        this.encumbrance.carry = strengthToCarryingCapacity(this.attributes.str.value);
    }
}

const SENSES_RANGES = [ 5, 10, 20, 50, 100, Number.MAX_VALUE ];
function awarenessToSensesRange(awareness: number) {
    return SENSES_RANGES[Math.min(Math.ceil(awareness / 2), SENSES_RANGES.length)]
}

const MOVEMENT_RATES = [ 20, 25, 30, 40, 60, 80 ];
function speedToMovementRate(speed: number) {
    return MOVEMENT_RATES[Math.min(Math.ceil(speed / 2), MOVEMENT_RATES.length)]
}

const LIFTING_CAPACITIES = [ 100, 200, 500, 1000, 5000, 10000 ];
function strengthToLiftingCapacity(strength: number) {
    return LIFTING_CAPACITIES[Math.min(Math.ceil(strength / 2), LIFTING_CAPACITIES.length)]
}

const CARRYING_CAPACITIES = [ 50, 100, 250, 500, 2500, 5000 ];
function strengthToCarryingCapacity(strength: number) {
    return CARRYING_CAPACITIES[Math.min(Math.ceil(strength / 2), CARRYING_CAPACITIES.length)]
}