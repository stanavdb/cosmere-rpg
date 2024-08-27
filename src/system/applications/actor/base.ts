import { CosmereActor } from '@system/documents/actor';
import { DeepPartial } from '@system/types/utils';

const { ActorSheetV2 } = foundry.applications.sheets;

// NOTE: Have to use type instead of interface to comply with AnyObject type
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type BaseActorSheetRenderContext = {
    actor: CosmereActor;
};

export class BaseActorSheet<
    T extends BaseActorSheetRenderContext = BaseActorSheetRenderContext,
> extends ActorSheetV2<T> {
    get actor(): CosmereActor {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return super.document;
    }

    /* --- Context --- */

    public async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>,
    ) {
        return {
            ...(await super._prepareContext(options)),
            actor: this.actor,
            editable: true, // TEMP
        };
    }
}
