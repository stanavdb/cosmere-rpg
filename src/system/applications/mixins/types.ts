import { ConstructorOf, AnyObject, EmptyObject } from '@system/types/utils';

export type ApplicationV2Constructor<
    RenderContext extends AnyObject = EmptyObject,
    Configuration extends
        foundry.applications.api.ApplicationV2.Configuration = foundry.applications.api.ApplicationV2.Configuration,
    RenderOptions extends
        foundry.applications.api.ApplicationV2.RenderOptions = foundry.applications.api.ApplicationV2.RenderOptions,
> = ConstructorOf<
    foundry.applications.api.ApplicationV2<
        RenderContext,
        Configuration,
        RenderOptions
    >
>;
