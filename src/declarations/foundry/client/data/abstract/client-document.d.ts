type Mixin<
  MixinClass extends new (...args: any[]) => any,
  BaseClass extends abstract new (...args: any[]) => any,
> = MixinClass & BaseClass;

declare function _ClientDocumentMixin<
    Schema extends foundry.abstract.DataModel = foundry.abstract.DataModel,
    Parent extends foundry.abstract.Document | null = null,
    BaseClass extends typeof foundry.abstract.Document<Schema, Parent>
>(
    base: BaseClass
): Mixin<ClientDocument, BaseClass>;

declare class ClientDocument {
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