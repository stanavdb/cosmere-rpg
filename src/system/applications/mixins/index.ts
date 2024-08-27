import { Mixin, ReturnTypeOf, AnyObject } from '@system/types/utils';

import { ComponentHandlebarsApplicationMixin } from './component-handlebars-application-mixin';

import { ApplicationV2Constructor } from './types';

export type HandlebarsApplicationClass<
    BaseClass extends
        ApplicationV2Constructor<AnyObject> = ApplicationV2Constructor,
> = ReturnTypeOf<typeof ComponentHandlebarsApplicationMixin<BaseClass>>;

export type ApplicationV2MixinFunc<
    BaseClass extends ApplicationV2Constructor<AnyObject>,
    MixinClass extends ApplicationV2Constructor,
> = (
    base: HandlebarsApplicationClass<BaseClass>,
) => Mixin<typeof base, [HandlebarsApplicationClass<MixinClass>]>;

export function ApplicationMixins<
    BaseClass extends ApplicationV2Constructor<AnyObject>,
    MixinClasses extends HandlebarsApplicationClass[],
>(
    base: BaseClass,
    ...mixins: ApplicationV2MixinFunc<
        BaseClass,
        MixinClasses extends (infer R)[] ? R : never
    >[]
) {
    return mixins.reduce((base, mixin) => {
        return mixin(base);
    }, ComponentHandlebarsApplicationMixin(base));
}
