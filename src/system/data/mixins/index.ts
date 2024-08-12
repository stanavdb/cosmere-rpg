type TypeDataModelClass<Parent extends foundry.abstract.Document> = typeof foundry.abstract.TypeDataModel<
    foundry.abstract.DataModel,
    Parent
>;

export function DataModelMixin<
    Parent extends foundry.abstract.Document
> (...mixins: ((base: TypeDataModelClass<Parent>) => TypeDataModelClass<Parent>)[]): TypeDataModelClass<Parent> {  
    return mixins.reduce((base, mixin) => {
        return mixin(base);
    }, BaseDataModel as typeof foundry.abstract.TypeDataModel<foundry.abstract.DataModel, Parent>);
}

class BaseDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {};
    }
}