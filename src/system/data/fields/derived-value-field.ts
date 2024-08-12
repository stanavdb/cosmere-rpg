import { ConstructorOf } from "@system/util/types";

// NOTE: Specifically use a namespace here to merge with interface declaration
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Derived {
  export function getValue<T extends number | string | boolean>(
    derived: Derived<T>,
  ) {
    return derived.useOverride ? derived.override : derived.value;
  }
}

/**
 * Type for dealing with derived values.
 * Provides standard functionality for manual overrides
 */
export interface Derived<T extends number | string | boolean> {
  /**
   * The derived value
   */
  value?: T;

  /**
   * The override value to use if `useOverride` is set to true
   */
  override?: T;

  /**
   * Whether or not the override value should be used (rather than the derived)
   */
  useOverride?: boolean;
}

export class DerivedValueField<
  ElementField extends
    | foundry.data.fields.NumberField
    | foundry.data.fields.StringField,
> extends foundry.data.fields.SchemaField {
  constructor(
    element: ElementField,
    options?: foundry.data.fields.DataFieldOptions,
    context?: foundry.data.fields.DataFieldContext,
  ) {
    // Update element options
    element.options.required = true;

    super(
      {
        value: element,
        override: new ((Object.getPrototypeOf(element) as object)
          .constructor as ConstructorOf<ElementField>)({
          ...element.options,
          required: false,
          nullable: true,
        }),
        useOverride: new foundry.data.fields.BooleanField({
          required: true,
          nullable: false,
          initial: false,
        }),
      },
      options,
      context,
    );
  }
}
