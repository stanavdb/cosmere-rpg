// Mixins
import { DataModelMixin } from '../mixins';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';

import { InjuryDuration } from '@system/types/cosmere';

export interface InjuryItemData extends DescriptionItemData {
    duration: {
        type: string;
        /*
         * Initial: rolled duration, in days
         * Remaining: time until the injury is healed, also in days
         *
         * These fields should be null for PermanentInjury or Death types
         */
        initial: number | null;
        remaining: number | null;
    };
}

export class InjuryItemDataModel extends DataModelMixin(
    DescriptionItemMixin(),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            // Default to flesh wound data as the least impactful injury type
            duration: new foundry.data.fields.SchemaField({
                type: new foundry.data.fields.StringField({
                    required: true,
                    nullable: false,
                    initial: InjuryDuration.FleshWound,
                }),
                initial: new foundry.data.fields.NumberField({
                    required: true,
                    nullable: true,
                    initial: 1,
                }),
                remaining: new foundry.data.fields.NumberField({
                    required: true,
                    nullable: true,
                    initial: 1,
                }),
            }),
        });
    }
}
