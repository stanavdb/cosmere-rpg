declare namespace foundry {
    namespace data {
        namespace fields {
            type DataSchema = {
                [key: string]: DataField
            }

            interface DataFieldValidationOptions {
                partial?: boolean;
                fallback?: boolean;
                source?: object;
                dropInvalidEmbedded?: boolean;
            }

            type DataFieldValidator = (value: any, options?: DataFieldValidationOptions) => boolean | void;

            interface DataFieldOptions {
                /**
                 * Is this field required to be populated?
                 * @default false
                 */
                required?: boolean;

                /**
                 * Can this field have null values?
                 * @default false
                 */
                nullable?: boolean;

                /**
                 * Can this field only be modified by a gamemaster or assistant gamemaster?
                 * @default false
                 */
                gmOnly?: boolean;

                /**
                 * The initial value of a field, or a function which assigns that initial value.
                 */
                initial?: function | any;

                /**
                 * A localizable label displayed on forms which render this field.
                 */
                label?: string;

                /**
                 * Localizable help text displayed on forms which render this field.
                 */
                hint?: string;

                /**
                 * A custom data field validation function.
                 */
                validate?: DataFieldValidator;

                /**
                 * A custom validation error string. When displayed will be prepended with the
                 * document name, field name, and candidate value. This error string is only
                 * used when the return type of the validate function is a boolean. If an Error
                 * is thrown in the validate function, the string message of that Error is used.
                 */
                validationError?: string;
            }

            interface DataFieldContext {
                name?: string;
                parent?: DataField;
            }

            class DataField {
                constructor(option?: DataFieldOptions, context?: DataFieldContext);
            }

            class SchemaField extends DataField {
                constructor(fields: DataSchema, options?: DataFieldOptions, context?: DataFieldContext);
            }

            class BooleanField extends DataField {}

            interface NumberFieldOptions extends DataFieldOptions {
                /**
                 * A minimum allowed value
                 */
                min?: number;

                /**
                 * A maximum allowed value
                 */
                max?: number;

                /**
                 * A permitted step size
                 */
                step?: number;

                /**
                 * Must the number be an integer?
                 * @default false
                 */
                integer?: boolean;

                /**
                 * Must the number be positive?
                 * @default false
                 */
                positive?: boolean;

                /**
                 * An array of values or an object of values/labels which represent
                 * allowed choices for the field. A function may be provided which dynamically
                 * returns the array of choices.
                 */
                choices?: number[] | object | function;
            }

            class NumberField extends DataField {
                constructor(options?: NumberFieldOptions, context?: DataFieldContext);
            }

            interface StringFieldOptions extends DataFieldOptions {
                /**
                 * Is the string allowed to be blank (empty)?
                 * @default true
                 */
                blank?: boolean;

                /**
                 * Should any provided string be trimmed as part of cleaning?
                 * @default true
                 */
                trim?: boolean;

                /**
                 * An array of values or an object of values/labels which represent
                 * allowed choices for the field. A function may be provided which dynamically
                 * returns the array of choices.
                 */
                choices?: string[] | number | function;

                /**
                 * Is this string field a target for text search?
                 * @default false
                 */
                textSearch?: boolean;
            }

            class StringField extends DataField {
                constructor(options?: StringFieldOptions, context?: DataFieldContext);
            }

            class ObjectField extends DataField {}

            interface ArrayFieldOptions extends DataFieldOptions {
                /**
                 * The minimum number of elements.
                 */
                min?: number;

                /**
                 * The maximum number of elements.
                 */
                max?: number;
            }

            class ArrayField extends DataField {
                constructor(element: DataField, options?: ArrayFieldOptions, context?: DataFieldContext);
            }

            class SetField extends ArrayField {}

            class HTMLField extends StringField {}
        }
    }
}