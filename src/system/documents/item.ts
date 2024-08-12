import { ItemType } from "@system/types/cosmere";
import { CosmereActor } from "./actor";

type DataModel = foundry.abstract.DataModel<DataSchema>;

export class CosmereItem<T extends DataModel = DataModel> extends Item<
  T,
  CosmereActor
> {
  declare type: ItemType;
}
