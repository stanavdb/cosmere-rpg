export {
    DeepPartial,
    AnyObject,
    EmptyObject,
} from '@league-of-foundry-developers/foundry-vtt-types/src/types/utils.mjs';

// NOTE: Using `any` in the below types as the resulting types don't rely on the `any`s
// However they cannot be replaced with other types (e.g. `unknown`) without breaking dependent typings

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ConstructorOf<T> = new (...args: any[]) => T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

export type Mixin<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BaseClass extends abstract new (...args: any[]) => any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MixinClasses extends (new (...args: any[]) => any)[],
> = BaseClass & (MixinClasses extends (infer R)[] ? R : never);

export enum MouseButton {
    /**
     * Usually the left mouse button.
     */
    Primary = 0,

    /**
     * Usually the right mouse button.
     */
    Secondary = 2,
}
