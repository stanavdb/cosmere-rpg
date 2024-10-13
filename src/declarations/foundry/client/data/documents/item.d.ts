interface EnrichmentAnchorOptions {
    /**
     * Attributes to set on the anchor.
     */
    attrs: Record<string, string>;

    /**
     * Data- attributes to set on the anchor.
     */
    dataset: Record<string, string>;

    /**
     * Classes to add to the anchor.
     */
    classes: string[];

    /**
     * The anchor's content.
     */
    name: string;

    /**
     * A font-awesome icon class to use as the icon.
     */
    icon: string;
}

declare class Item<
    D extends foundry.abstract.DataSchema = foundry.abstract.DataSchema,
    P extends foundry.abstract.Document<
        foundry.abstract.DataModel,
        foundry.abstract.Document | null
    > = foundry.abstract.Document,
> extends _ClientDocumentMixin<D, P>(foundry.documents.BaseItem<D, P>) {
    public readonly type: string;
    public readonly name: string;
    public readonly img: string;
    public readonly system: D;

    get actor(): P | undefined;
    get effects(): Collection<ActiveEffect>;

    public getRollData(): D;

    /**
     * Determine default artwork based on the provided item data.
     * @param itemData  The source item data.
     * @returns         Candidate item image.
     */
    public static getDefaultArtwork(itemData: object): { img: string };

    /**
     * Create a content link for this Document.
     * @param options   Additional options to configure how the link is constructed.
     */
    public toAnchor(
        options?: Partial<EnrichmentAnchorOptions>,
    ): HTMLAnchorElement;
}
