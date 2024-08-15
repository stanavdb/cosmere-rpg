namespace foundry {
    namespace abstract {
        type DataSchema = {
            [key: string]: any;
        };

        abstract class Document<
            Schema extends DataSchema = DataSchema,
            Parent extends Document | null = Document | null,
        > extends DataModel<DataSchema, Parent> {
            readonly system: Schema;
        }

        interface DataValidationOptions {
            /**
             * Throw an error if validation fails.
             * @default true
             */
            strict?: boolean;

            /**
             * Attempt to replace invalid values with valid defaults?
             * @default false
             */
            fallback?: boolean;

            /**
             * Allow partial source data, ignoring absent fields?
             * @default false
             */
            partial?: boolean;

            /**
             * If true, invalid embedded documents will emit a warning and be
             * placed in the invalidDocuments collection rather than causing the
             * parent to be considered invalid.
             */
            dropInvalidEmbedded?: boolean;
        }

        interface DataModelValidationOptions {
            /**
             * A specific set of proposed changes to validate, rather than the full source data of the model.
             */
            changes?: object;

            /**
             * If changes are provided, attempt to clean the changes before validating them?
             * @default false
             */
            clean?: boolean;

            /**
             * Allow replacement of invalid values with valid defaults?
             * @default false
             */
            fallback?: boolean;

            /**
             * If true, invalid embedded documents will emit a warning and
             * be placed in the invalidDocuments collection rather than
             * causing the parent to be considered invalid.
             */
            dropInvalidEmbedded?: boolean;

            /**
             * Throw if an invalid value is encountered, otherwise log a warning?
             * @default true
             */
            strict?: boolean;

            /**
             * Perform validation on individual fields?
             * @default true
             */
            fields?: boolean;

            /**
             * Perform joint validation on the full data model?
             * Joint validation will be performed by default if no changes are passed.
             * Joint validation will be disabled by default if changes are passed.
             * Joint validation can be performed on a complete set of changes (for
             * example testing a complete data model) by explicitly passing true.
             */
            joint?: boolean;
        }

        declare const DynamicClass: new <_Computed extends object>(
            ...args: any[]
        ) => _Computed;

        // @ts-expect-error - This is a workaround to allow for dynamic top level properties in a class.
        declare class _InternalDataModel<
            Schema extends DataSchema,
            // Do not inline. Being a type parameter is an important part of the circumvention of TypeScript's detection of dynamic classes.
            _Computed extends object = Schema,
        > extends DynamicClass<_Computed> {}

        declare class DataModel<
            Schema extends DataSchema = DataSchema,
            Parent extends Document | null = Document | null,
        > extends _InternalDataModel<Schema> {
            public readonly parent: Parent;

            /**
             * Configure the data model instance before validation and initialization workflows are performed.
             */
            public _configure(options = {});

            /**
             * The source data object for this DataModel instance.
             * Once constructed, the source object is sealed such that no keys may be added nor removed.
             */
            _source: object;

            /**
             * The defined and cached Data Schema for all instances of this DataModel.
             */
            static _schema: foundry.data.fields.SchemaField;

            /**
             * An immutable reverse-reference to a parent DataModel to which this model belongs.
             */
            parent: DataModel | null;

            /**
             * Define the data schema for documents of this type.
             * The schema is populated the first time it is accessed and cached for future reuse.
             * @virtual
             */
            static defineSchema(): foundry.data.fields.DataSchema {}

            /**
             * The Data Schema for all instances of this DataModel.
             */
            static readonly schema: foundry.data.fields.DataSchema;

            /**
             * Define the data schema for this document instance.
             */
            readonly schema: foundry.data.fields.DataSchema;

            /**
             * Is the current state of this DataModel invalid?
             * The model is invalid if there is any unresolved failure.
             */
            readonly invalid: boolean;

            /**
             * An array of validation failure instances which may have occurred when this instance was last validated.
             */
            get validationFailures(): {
                fields: foundry.data.validation.DataModelValidationFailure | null;
                joint: foundry.data.validation.DataModelValidationFailure | null;
            };

            /**
             * A set of localization prefix paths which are used by this DataModel.
             */
            static LOCALIZATION_PREFIXES: string[] = [];

            /**
             * Initialize the source data for a new DataModel instance.
             * One-time migrations and initial cleaning operations are applied to the source data.
             * @param data The candidate source data from which the model will be constructed
             * @param options Options provided to the model constructor
             * @returns Migrated and cleaned source data which will be stored to the model instance
             */
            _initializeSource(
                data: object | DataModel,
                options?: object,
            ): object;

            /**
             * Clean a data source object to conform to a specific provided schema.
             * @param source The source data object
             * @param options Additional options which are passed to field cleaning methods
             * @returns The cleaned source data
             */
            static cleanData(source?: object, options?: object): object;

            /**
             * Initialize the instance by copying data from the source object to instance attributes.
             * This mirrors the workflow of SchemaField#initialize but with some added functionality.
             * @param options Options provided to the model constructor
             */
            _initialize(options?: object);

            /**
             * Reset the state of this data instance back to mirror the contained source data, erasing any changes.
             */
            reset();

            /**
             * Clone a model, creating a new data model by combining current data with provided overrides.
             * @param data Additional data which overrides current document data at the time of creation
             * @param context Context options passed to the data model constructor
             * @returns The cloned Document instance
             */
            clone(
                data?: object,
                context?: object,
            ): Document | Promise<Document>;

            /**
             * Validate the data contained in the document to check for type and content
             * This function throws an error if data within the document is not valid
             * @param options Optional parameters which customize how validation occurs.
             */
            validate(options?: DataModelValidationOptions): boolean;

            /**
             * Evaluate joint validation rules which apply validation conditions across multiple fields of the model.
             * Field-specific validation rules should be defined as part of the DataSchema for the model.
             * This method allows for testing aggregate rules which impose requirements on the overall model.
             * @param data Candidate data for the model
             * @throws An error if a validation failure is detected
             */
            static validateJoint(data: object);

            /**
             * Update the DataModel locally by applying an object of changes to its source data.
             * The provided changes are cleaned, validated, and stored to the source data object for this model.
             * The source data is then re-initialized to apply those changes to the prepared data.
             * The method returns an object of differential changes which modified the original data.
             * @param changes New values which should be applied to the data model
             * @param options Options which determine how the new data is merged
             * @returns An object containing the changed keys and values
             */
            updateSource(changes?: object, options?: object): object;

            _validateModel(changes: object, options?: object);

            /**
             * Copy and transform the DataModel into a plain object.
             * Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.
             * @param source Draw values from the underlying data source rather than transformed values - defaults to true
             * @returns The extracted primitive object
             */
            toObject(source?: boolean): object;

            /**
             * Extract the source data for the DataModel into a simple object format that can be serialized.
             * @returns The document source data expressed as a plain object
             */
            toJSON(): object;

            update(data?: object);

            /**
             * Apply transformations of derivations to the values of the source data object.
             * Compute data fields whose values are not stored to the database.
             *
             * Called before {@link ClientDocument#prepareDerivedData} in {@link ClientDocument#prepareData}.
             */
            public prepareBaseData();

            /**
             * Apply transformations of derivations to the values of the source data object.
             * Compute data fields whose values are not stored to the database.
             *
             * Called before {@link ClientDocument#prepareDerivedData} in {@link ClientDocument#prepareData}.
             */
            public prepareDerivedData();
        }

        declare class TypeDataModel<
            Schema extends DataSchema = DataSchema,
            Parent extends Document | null = Document | null,
        > extends DataModel<Schema, Parent> {}
    }
}
