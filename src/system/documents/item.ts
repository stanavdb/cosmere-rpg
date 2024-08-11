import { CosmereActor } from './actor';

type TypeDataModel = foundry.abstract.TypeDataModel;

export class CosmereItem<T extends TypeDataModel = TypeDataModel> extends Item<T, CosmereActor> {

}