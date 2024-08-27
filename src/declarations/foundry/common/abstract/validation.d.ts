declare namespace foundry {
    namespace data {
        namespace validation {
            class DataModelValidationError extends Error {
                constructor(errors: Record<string, any>);
            }
        }
    }
}
