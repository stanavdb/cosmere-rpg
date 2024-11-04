import { CosmereItem } from '@system/documents';
import { TalentTree } from '@system/types/item';

import {
    CollectionField,
    RecordCollection,
    CollectionFieldOptions,
} from '@system/data/fields';

export class TalentTreeNodeCollectionField extends CollectionField<TalentTreeNodeField> {
    constructor(
        options?: CollectionFieldOptions,
        context?: foundry.data.fields.DataFieldContext,
    ) {
        super(
            new TalentTreeNodeField({
                nullable: true,
            }),
            options,
            context,
            NodeRecordCollection as typeof RecordCollection,
        );
    }
}

class NodeRecordCollection extends RecordCollection<TalentTree.Node> {
    public override set(id: string, value: TalentTree.Node): this {
        // Ensure the node id matches the record id
        if (value) {
            value.id = id;
        }

        // Set the record
        return super.set(id, value);
    }

    public override delete(id: string): boolean {
        // Remove the record
        const deleted = super.delete(id);

        // Remove any references to the deleted node
        if (deleted) {
            this.forEach((node) => {
                node.connections = node.connections.filter((c) => c !== id);
            });
        }

        return deleted;
    }
}

class TalentTreeNodeField extends foundry.data.fields.SchemaField {
    constructor(
        options?: foundry.data.fields.DataFieldOptions,
        context?: foundry.data.fields.DataFieldContext,
    ) {
        options ??= {};
        options.gmOnly = true;

        super(
            {
                id: new foundry.data.fields.DocumentIdField({
                    required: true,
                    nullable: false,
                    blank: false,
                    gmOnly: true,
                }),
                type: new foundry.data.fields.StringField({
                    required: false,
                    nullable: true,
                    blank: false,
                    initial: TalentTree.Node.Type.Icon,
                    choices: [
                        TalentTree.Node.Type.Icon,
                        TalentTree.Node.Type.Text,
                    ],
                    gmOnly: true,
                }),
                item: new foundry.data.fields.EmbeddedDocumentField(
                    CosmereItem as typeof foundry.abstract.Document,
                    {
                        required: true,
                        nullable: false,
                        gmOnly: true,
                    },
                ),
                connections: new foundry.data.fields.ArrayField(
                    /**
                     * DocumentIdField is really just a StringField that validates
                     * if the value is in the format of a foundry ID.
                     * It doesn't actually have anything to do with documents.
                     */
                    new foundry.data.fields.DocumentIdField({
                        blank: false,
                        nullable: false,
                        gmOnly: true,
                    }),
                    {
                        required: true,
                        nullable: false,
                        gmOnly: true,
                        initial: [],
                    },
                ),
                position: new foundry.data.fields.SchemaField(
                    {
                        row: new foundry.data.fields.NumberField({
                            required: true,
                            nullable: false,
                            gmOnly: true,
                        }),
                        column: new foundry.data.fields.NumberField({
                            required: true,
                            nullable: false,
                            gmOnly: true,
                        }),
                    },
                    {
                        required: true,
                        nullable: false,
                        gmOnly: true,
                    },
                ),
            },
            options,
            context,
        );
    }
}
