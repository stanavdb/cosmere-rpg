declare interface Item<
    D extends foundry.abstract.DataModel = foundry.abstract.DataModel,
    P extends foundry.abstract.Document = foundry.abstract.Document
> extends ClientDocumentMixin(foundry.documents.BaseItem) {
    public readonly type: string;
    public readonly name: string;
    public readonly system: D;
    
    get actor(): P;
}