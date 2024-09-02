export * from './component-handlebars-application-mixin';

import { ReturnTypeOf, AnyObject } from '@system/types/utils';

import { ComponentHandlebarsApplicationMixin } from './component-handlebars-application-mixin';

import { ApplicationV2Constructor } from './types';

export type HandlebarsApplicationClass<
    BaseClass extends
        ApplicationV2Constructor<AnyObject> = ApplicationV2Constructor<AnyObject>,
> = ReturnTypeOf<typeof ComponentHandlebarsApplicationMixin<BaseClass>>;

// export type ApplicationV2MixinFunc<
//     BaseClass extends ApplicationV2Constructor<AnyObject>,
//     MixinClass extends ApplicationV2Constructor<AnyObject> = ApplicationV2Constructor<AnyObject>,
// > = (
//     base: HandlebarsApplicationClass<BaseClass>,
// ) => Mixin<typeof base, MixinClass>;

// export function ApplicationMixins<
//     BaseClass extends ApplicationV2Constructor<AnyObject>,
//     Mixins extends ApplicationV2MixinFunc<BaseClass, ApplicationV2Constructor<AnyObject>>[],
// >(
//     base: BaseClass,
//     ...mixins: Mixins
// ) {
//     return mixins.reduce((base, mixin) => {
//         return mixin(base);
//     }, ComponentHandlebarsApplicationMixin(base)) as any as BaseClass & ListToIntersection<MixinClasses<Mixins, BaseClass>>;
// }

// type MixinContstructor<T extends new () => any> = {
//     [K in keyof T]: T[K]
// } & {
//     new: (...args: any[]) => T
// }

// type MixinClasses<
//     Mixins,
//     BaseClass extends ApplicationV2Constructor<AnyObject>
// > = Mixins extends ApplicationV2MixinFunc<BaseClass, ApplicationV2Constructor<AnyObject>>[] ?
//     ReturnTypeOfArray<Mixins> : never;

// type ConstructorOfArray<T extends (new () => any)[]> =
//     T extends [ infer R, ...infer K ] ?
//         [
//             R extends new () => any ? MixinContstructor<R> : never,
//             ...(
//                 K extends any[] ?
//                     ConstructorOfArray<K> : []
//             )
//         ] : [];

// type NonConstructorOfArray<T extends any[]> =
//     T extends [ infer R, ...infer K ] ?
//     [
//         NonConstructor<R>,
//         ...(
//             K extends any[] ?
//                 NonConstructorOfArray<K> : []
//         )
//     ] : [];

// type ReturnTypeOfArray<T extends Function[]> =
//     T extends [infer R, ...infer K] ?
//         [
//             ReturnTypeOf<R>,
//             ...(K extends Function[] ?
//                 ReturnTypeOfArray<K> : []
//             )
//         ] : [];

// // type ArrayType<T> = T extends Array<infer R> ? R : never;
// // // type ArrayType<T> = T extends  [...infer R, infer P] ? P : never;
// // // type ListToIntersection<R extends any[]> = R extends [infer H, ...infer S] ? H & ListToIntersection<S>  : unknown

// // function test1() {
// //     return 'test1'
// // }

// // function test2() {
// //     return 2;
// // }

// // type Test = ReturnTypeOfArray<[ typeof test1, typeof test2 ]>

// // // type Test = ListToIntersection<[ typeof Test2, typeof Test3 ]>

// // type ArrayMixin<
// //     Base extends abstract new (...args: any[]) => any,
// //     Mixins extends (new (...args: any[]) => any)[]
// // > = Base & ListToIntersection<Mixins>;

// // type MixedClasses = ArrayMixin<typeof Test1, [ typeof Test2, typeof Test3 ]>
// // const TestClass: MixedClasses = {} as any;
// // TestClass.
