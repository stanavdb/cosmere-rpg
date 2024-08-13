declare class Item<
    D extends foundry.abstract.DataModel = foundry.abstract.DataModel,
    P extends foundry.abstract.Document<
        foundry.abstract.DataModel,
        foundry.abstract.Document | null
    > = foundry.abstract.Document,
> extends _ClientDocumentMixin<D, P>(foundry.documents.BaseItem<D, P>) {
    public readonly type: string;
    public readonly name: string;
    public readonly system: D;

    get actor(): P;
}
