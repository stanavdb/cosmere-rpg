import { CosmereActor } from './actor';

type DataModel = foundry.abstract.DataModel<any>;

export class CosmereItem<T extends DataModel = DataModel> extends Item<T, CosmereActor> {
    
}