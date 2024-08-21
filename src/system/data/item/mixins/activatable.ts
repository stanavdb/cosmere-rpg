import {
    ActivationType,
    ActionCostType,
    ItemConsumeType,
    Resource,
    ItemResource,
    Skill,
    Attribute,
    ItemRechargeType,
} from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';

interface ItemResourceData {
    value: number;
    max?: number;
    recharge?: ItemRechargeType;
}

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
            resource?: Resource | ItemResource;
        };

        flavor?: string;

        /* -- Skill test activation -- */
        skill?: Skill;
        attribute?: Attribute;
    };

    resources?: Record<ItemResource, ItemResourceData | undefined>;
}

export function ActivatableItemMixin<P extends CosmereItem>() {
    return (
        base: typeof foundry.abstract.TypeDataModel<ActivatableItemData, P>,
    ) => {
        return class mixin extends base {
            static defineSchema() {
                const itemResources = CONFIG.COSMERE.items.resources.types;

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
                                        CONFIG.COSMERE.action.costs,
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
                                    initial: ItemConsumeType.ItemResource,
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
                                    choices: [
                                        ...Object.keys(
                                            CONFIG.COSMERE.resources,
                                        ),
                                        ...Object.keys(
                                            CONFIG.COSMERE.items.resources
                                                .types,
                                        ),
                                    ],
                                    initial: ItemResource.Use,
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
                            nullable: true,
                            blank: false,
                            choices: Object.keys(CONFIG.COSMERE.attributes),
                        }),
                    }),
                    resources: new foundry.data.fields.SchemaField(
                        (Object.keys(itemResources) as ItemResource[]).reduce(
                            (schema, resource) => {
                                schema[resource] =
                                    new foundry.data.fields.SchemaField(
                                        {
                                            value: new foundry.data.fields.NumberField(
                                                {
                                                    required: true,
                                                    nullable: false,
                                                    min: 0,
                                                    integer: true,
                                                },
                                            ),
                                            max: new foundry.data.fields.NumberField(
                                                {
                                                    min: 0,
                                                    integer: true,
                                                },
                                            ),
                                            recharge:
                                                new foundry.data.fields.StringField(
                                                    {
                                                        nullable: true,
                                                        blank: false,
                                                        choices: Object.keys(
                                                            CONFIG.COSMERE.items
                                                                .resources
                                                                .recharge,
                                                        ),
                                                    },
                                                ),
                                        },
                                        {
                                            required: false,
                                            nullable: true,
                                            initial: null,
                                        },
                                    );

                                return schema;
                            },
                            {} as Record<
                                string,
                                foundry.data.fields.SchemaField
                            >,
                        ),
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
