declare interface Actor<
    D extends foundry.abstract.DataModel = foundry.abstract.DataModel,
    I extends Item = Item
> extends ClientDocumentMixin(foundry.documents.BaseActor) {
    public readonly type: string;
    public readonly name: string;
    public readonly system: D;

    get flags(): Record<string, any>;
    get items(): Item[];
}