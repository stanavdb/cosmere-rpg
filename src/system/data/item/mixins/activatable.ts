import {
    ActivationType,
    ActionCostType,
    ItemConsumeType,
    Resource,
    Skill,
    Attribute,
} from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';

export interface ActivatableItemData {
    activation: {
        type?: ActivationType;
        cost?: {
            value?: number;
            type?: ActionCostType;
        };
        consume?: {
            type: ItemConsumeType;
            value: number;
            resource?: Resource;
        };

        flavor?: string;

        /* -- Skill test activation -- */
        skill?: Skill;
        attribute?: Attribute;
    };

    resources?: {
        charge?: {
            value: number;
            max?: number;
        };
    };
}

export function ActivatableItemMixin<P extends CosmereItem>() {
    return (
        base: typeof foundry.abstract.TypeDataModel<ActivatableItemData, P>,
    ) => {
        return class mixin extends base {
            static defineSchema() {
                return foundry.utils.mergeObject(super.defineSchema(), {
                    activation: new foundry.data.fields.SchemaField({
                        type: new foundry.data.fields.StringField({
                            blank: false,
                            choices: Object.keys(
                                CONFIG.COSMERE.items.activation.types,
                            ),
                        }),
                        cost: new foundry.data.fields.SchemaField(
                            {
                                value: new foundry.data.fields.NumberField({
                                    min: 0,
                                    integer: true,
                                }),
                                type: new foundry.data.fields.StringField({
                                    choices: Object.keys(
                                        CONFIG.COSMERE.actionCosts,
                                    ),
                                }),
                            },
                            {
                                required: false,
                                nullable: true,
                                initial: null,
                            },
                        ),
                        consume: new foundry.data.fields.SchemaField(
                            {
                                type: new foundry.data.fields.StringField({
                                    required: true,
                                    nullable: false,
                                    blank: false,
                                    choices: Object.keys(
                                        CONFIG.COSMERE.items.activation
                                            .consumeTypes,
                                    ),
                                    initial: ItemConsumeType.Charge,
                                }),
                                value: new foundry.data.fields.NumberField({
                                    required: true,
                                    nullable: false,
                                    min: 0,
                                    integer: true,
                                    initial: 0,
                                }),
                                resource: new foundry.data.fields.StringField({
                                    blank: false,
                                    choices: Object.keys(
                                        CONFIG.COSMERE.resources,
                                    ),
                                }),
                            },
                            {
                                required: false,
                                nullable: true,
                                initial: null,
                            },
                        ),
                        flavor: new foundry.data.fields.HTMLField(),
                        skill: new foundry.data.fields.StringField({
                            blank: false,
                            choices: Object.keys(CONFIG.COSMERE.skills),
                        }),
                        attribute: new foundry.data.fields.StringField({
                            blank: false,
                            choices: Object.keys(CONFIG.COSMERE.attributes),
                        }),
                    }),
                    resources: new foundry.data.fields.SchemaField(
                        {
                            charge: new foundry.data.fields.SchemaField(
                                {
                                    value: new foundry.data.fields.NumberField({
                                        required: true,
                                        nullable: false,
                                        min: 0,
                                        integer: true,
                                        initial: 0,
                                    }),
                                    max: new foundry.data.fields.NumberField({
                                        min: 0,
                                        integer: true,
                                    }),
                                },
                                {
                                    required: false,
                                    nullable: true,
                                    initial: null,
                                },
                            ),
                        },
                        {
                            required: false,
                            nullable: true,
                            initial: null,
                        },
                    ),
                });
            }

            public prepareDerivedData() {
                super.prepareDerivedData();

                // Ensure that no resource value exceeds its max
                if (this.resources) {
                    if (this.resources.charge && !!this.resources.charge.max) {
                        this.resources.charge.value = Math.max(
                            0,
                            Math.min(
                                this.resources.charge.max,
                                this.resources.charge.value,
                            ),
                        );
                    }
                }
            }
        };
    };
}
