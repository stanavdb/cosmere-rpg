import { Skill, PowerType } from '@system/types/cosmere';
import { CosmereItem } from '@system/documents';

// Mixins
import { DataModelMixin } from '../mixins';
import { IdItemMixin, IdItemData } from './mixins/id';
import { TypedItemMixin, TypedItemData } from './mixins/typed';
import {
    ActivatableItemData,
    ActivatableItemMixin,
} from './mixins/activatable';
import {
    DescriptionItemMixin,
    DescriptionItemData,
} from './mixins/description';

export interface PowerItemData
    extends IdItemData,
        TypedItemData<PowerType>,
        DescriptionItemData {
    /**
     * The skill associated with this power.
     * This cannot be a core skill.
     */
    skill: Skill | null;
}

export class PowerItemDataModel extends DataModelMixin<
    PowerItemData,
    CosmereItem
>(
    IdItemMixin({
        initialFromName: true,
    }),
    TypedItemMixin({
        initial: () => Object.keys(CONFIG.COSMERE.power.types)[0],
        choices: () =>
            Object.entries(CONFIG.COSMERE.power.types).reduce(
                (acc, [key, config]) => ({
                    ...acc,
                    [key]: config.label,
                }),
                {},
            ),
    }),
    ActivatableItemMixin(),
    DescriptionItemMixin({
        value: 'COSMERE.Item.Type.Power.desc_placeholder',
    }),
) {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            skill: new foundry.data.fields.StringField({
                required: true,
                nullable: true,
                blank: false,
                label: 'COSMERE.Item.Power.Skill.Label',
                hint: 'COSMERE.Item.Power.Skill.Hint',
                initial: null,
                choices: () =>
                    Object.entries(CONFIG.COSMERE.skills)
                        .filter(([key, skill]) => !skill.core)
                        .reduce(
                            (acc, [key, skill]) => ({
                                ...acc,
                                [key]: skill.label,
                            }),
                            {},
                        ),
            }),
        });
    }
}
