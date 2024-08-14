namespace foundry {
    namespace documents {
        declare class BaseActor<
            Schema extends
                foundry.abstract.DataSchema = foundry.abstract.DataSchema,
            Parent extends Document | null = null,
        > extends foundry.abstract.Document<Schema, Parent> {}
    }
}
