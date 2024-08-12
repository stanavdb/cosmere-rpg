type TypeDataModelClass<
  Schema extends foundry.abstract.DataSchema,
  Parent extends foundry.abstract.Document,
> = typeof foundry.abstract.TypeDataModel<Schema, Parent>;

export function DataModelMixin<
  Schema extends foundry.abstract.DataSchema,
  Parent extends foundry.abstract.Document = foundry.abstract.Document,
>(
  ...mixins: ((
    base: TypeDataModelClass<foundry.abstract.DataSchema, Parent>,
  ) => TypeDataModelClass<foundry.abstract.DataSchema, Parent>)[]
): TypeDataModelClass<Schema, Parent> {
  return mixins.reduce(
    (base, mixin) => {
      return mixin(base);
    },
    BaseDataModel as typeof foundry.abstract.TypeDataModel<
      foundry.abstract.DataModel,
      Parent
    >,
  ) as typeof foundry.abstract.TypeDataModel<Schema, Parent>;
}

class BaseDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {};
  }
}
