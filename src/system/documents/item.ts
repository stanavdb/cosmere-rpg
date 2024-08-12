import { ItemType } from "@system/types/cosmere";
import { CosmereActor } from "./actor";

export class CosmereItem<
  T extends foundry.abstract.DataModel = foundry.abstract.DataModel,
> extends Item<T, CosmereActor> {
  declare type: ItemType;
}
