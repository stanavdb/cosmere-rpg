import { ActorType } from '@system/types/cosmere';

import { AdversaryActorDataModel } from './adversary';
import { CharacterActorDataModel } from './character';

export const config: Record<ActorType, typeof foundry.abstract.TypeDataModel> = {
    [ActorType.Character]: CharacterActorDataModel as any,
    [ActorType.Adversary]: AdversaryActorDataModel as any
}

export { AdversaryActorData } from './adversary';
export { CharacterActorData } from './character';