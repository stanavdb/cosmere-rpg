import { Size, CreatureType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';

// Mixins
import { DataModelMixin } from '../mixins';
import { IdItemMixin, IdItemData } from './mixins/id';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';

interface TalentGrant {
    id: string;
    name: string;
    level: number;
}

interface ExtraTalentPicks {
    restrictions: string; // TODO: link up with the Talent Pre-reqs?;
    levels: {
        level: number;
        quantity: number;
    }[];
}
export interface AncestryItemData extends IdItemData, DescriptionItemData {
    size: Size;
    type: {
        id: CreatureType;
        custom?: string | null;
        subtype?: string | null;
    };
    advancement: {
        extraPath: string;
        extraTalents: TalentGrant[];
        extraTalentPicks: ExtraTalentPicks;
    };
}

export class AncestryItemDataModel extends DataModelMixin<
    AncestryItemData,
    CosmereItem
>(
    IdItemMixin({
        initial: 'none',
    }),
    DescriptionItemMixin({
        value: 'COSMERE.Item.Type.Ancestry.desc_placeholder',
    }),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            size: new foundry.data.fields.StringField({
                required: true,
                nullable: false,
                blank: false,
                initial: Size.Medium,
                choices: Object.entries(CONFIG.COSMERE.sizes).reduce(
                    (acc, [key, config]) => ({
                        ...acc,
                        [key]: config.label,
                    }),
                    {},
                ),
            }),
            type: new foundry.data.fields.SchemaField({
                id: new foundry.data.fields.StringField({
                    required: true,
                    nullable: false,
                    blank: false,
                    initial: CreatureType.Humanoid,
                    choices: Object.entries(
                        CONFIG.COSMERE.creatureTypes,
                    ).reduce(
                        (acc, [key, config]) => ({
                            ...acc,
                            [key]: config.label,
                        }),
                        {},
                    ),
                }),
                custom: new foundry.data.fields.StringField({ nullable: true }),
                subtype: new foundry.data.fields.StringField({
                    nullable: true,
                }),
            }),
            advancement: new foundry.data.fields.SchemaField({
                extraTalentPicks: new foundry.data.fields.SchemaField({
                    levels: new foundry.data.fields.ArrayField(
                        new foundry.data.fields.SchemaField({
                            level: new foundry.data.fields.NumberField(),
                            quantity: new foundry.data.fields.NumberField(),
                        }),
                    ),
                    restrictions: new foundry.data.fields.StringField(),
                }),
                extraPath: new foundry.data.fields.StringField(),
                extraTalents: new foundry.data.fields.ArrayField(
                    new foundry.data.fields.SchemaField({
                        id: new foundry.data.fields.StringField(),
                        name: new foundry.data.fields.StringField(),
                        level: new foundry.data.fields.NumberField(),
                    }),
                ),
            }),
        });
    }

    get typeFieldId(): foundry.data.fields.StringField {
        return this.schema.fields.type._getField([
            'id',
        ]) as foundry.data.fields.StringField;
    }

    get sizeField(): foundry.data.fields.StringField {
        return this.schema.fields.size as foundry.data.fields.StringField;
    }

    get extraTalents(): TalentGrant[] {
        return this.advancement.extraTalents;
    }

    get extraTalentPicks(): ExtraTalentPicks {
        return this.advancement.extraTalentPicks;
    }
}
