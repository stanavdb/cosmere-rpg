import { CommonActorDataModel, CommonActorData } from "./common";

// NOTE: Awaiting implementation
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AdversaryActorData extends CommonActorData {}

// NOTE: Empty interface is used to merge definitions here,
// which is used to merge schema properties onto data model
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging
export interface AdversaryActorDataModel extends AdversaryActorData {}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class AdversaryActorDataModel extends CommonActorDataModel {}
