type TypeDataModelClass = typeof foundry.abstract.TypeDataModel;

export function DataModelMixin(...mixins: ((base: TypeDataModelClass) => TypeDataModelClass)[]): TypeDataModelClass {  
    return mixins.reduce((base, mixin) => {
        return mixin(base);
    }, BaseDataModel as typeof foundry.abstract.TypeDataModel);
}

class BaseDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {};
    }
}