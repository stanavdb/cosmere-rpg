export * from './component-handlebars-application-mixin';

import { ReturnTypeOf, AnyObject } from '@system/types/utils';

import { ComponentHandlebarsApplicationMixin } from './component-handlebars-application-mixin';

import { ApplicationV2Constructor } from './types';

export type HandlebarsApplicationClass<
    BaseClass extends
        ApplicationV2Constructor<AnyObject> = ApplicationV2Constructor<AnyObject>,
> = ReturnTypeOf<typeof ComponentHandlebarsApplicationMixin<BaseClass>>;

export * from './tabs';
export * from './drag-drop';
