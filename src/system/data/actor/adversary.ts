import { AdversaryRole } from '@system/types/cosmere';
import { CommonActorDataModel, CommonActorData } from './common';

export interface AdversaryActorData extends CommonActorData {
    tier: number;
    role?: AdversaryRole;
}

export class AdversaryActorDataModel extends CommonActorDataModel<AdversaryActorData> {}
