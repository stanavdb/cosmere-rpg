interface FoundryDocumentConfig {
  dataModels: Record<
    string,
    typeof foundry.abstract.TypeDataModel<
      foundry.abstract.DataModel,
      foundry.abstract.Document | null
    >
  >;

  documentClass: typeof foundry.abstract.Document<
    foundry.abstract.DataModel,
    foundry.abstract.Document | null
  >;
}

declare interface CONFIG {
  Actor: FoundryDocumentConfig;
  Item: FoundryDocumentConfig;
}
