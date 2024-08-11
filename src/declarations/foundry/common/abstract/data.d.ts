declare namespace foundry {
    namespace abstract {
        class TypeDataModel<P extends Document = Document> {
            static defineSchema(): foundry.data.fields.DataSchema {}

            public readonly parent: P;

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
    }
}