import { Resource } from '@src/system/types/cosmere';
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
    /* eslint-disable @typescript-eslint/unbound-method */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        form: {
            handler: this.onFormEvent,
            submitOnChange: true,
        } as unknown,
    });
    /* eslint-enable @typescript-eslint/unbound-method */

    get actor(): CosmereActor {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return super.document;
    }

    /* --- Form --- */

    public static onFormEvent(
        this: BaseActorSheet,
        event: Event,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        Object.keys(this.actor.system.resources).forEach((resourceId) => {
            let resourceValue = formData.object[
                `system.resources.${resourceId}.value`
            ] as string;

            // Clean the value
            resourceValue = resourceValue
                .replace(/[^-+\d]/g, '')
                .replace(/((?<=\d+)\b.*)|((\+|-)*(?=(\+|-)\d))/g, '');

            // Get the number value
            let numValue = Number(resourceValue.replace(/\+|-/, ''));
            numValue = isNaN(numValue) ? 0 : numValue;

            if (resourceValue.includes('-'))
                numValue =
                    this.actor.system.resources[resourceId as Resource].value -
                    numValue;
            else if (resourceValue.includes('+'))
                numValue =
                    this.actor.system.resources[resourceId as Resource].value +
                    numValue;

            formData.object[`system.resources.${resourceId}.value`] = numValue;
        });

        // Update document
        void this.actor.update(formData.object, { diff: false });
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
