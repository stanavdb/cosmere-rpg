declare type Mixin<
    MixinClass extends new (...args: any[]) => any,
    BaseClass extends abstract new (...args: any[]) => any,
> = BaseClass & MixinClass;

declare function _ClientDocumentMixin<
    Schema extends foundry.abstract.DataModel = foundry.abstract.DataModel,
    Parent extends foundry.abstract.Document | null = null,
    BaseClass extends typeof foundry.abstract.Document<Schema, Parent>,
>(base: BaseClass): Mixin<BaseClass, typeof _ClientDocument>;

declare class _ClientDocument {
    /**
     * Lazily obtain a FormApplication instance used to configure this Document, or null if no sheet is available.
     */
    get sheet(): Application | foundry.applications.api.ApplicationV2 | null;

    /**
     * Apply transformations of derivations to the values of the source data object.
     * Compute data fields whose values are not stored to the database.
     *
     * Called before {@link ClientDocument#prepareDerivedData} in {@link ClientDocument#prepareData}.
     */
    public prepareBaseData();

    /**
     * Apply transformations of derivations to the values of the source data object.
     * Compute data fields whose values are not stored to the database.
     *
     * Called before {@link ClientDocument#prepareDerivedData} in {@link ClientDocument#prepareData}.
     */
    public prepareDerivedData();
}
