declare class Actor<
    D extends foundry.abstract.DataModel = foundry.abstract.DataModel,
    I extends Item = Item,
> extends _ClientDocumentMixin<D>(foundry.documents.BaseActor<D>) {
    public readonly type: string;
    public readonly name: string;
    public readonly system: D;

    get items(): I[];

    public getRollData(): object;
}
