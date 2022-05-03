import type { BlockType, Document } from "@dedit/models/src/v1";
import type { Version } from "@dedit/models/src/version";

import { Document as MongooseDocument } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

// omit the revision field as this is stored in a separate model.
export type IDocument = Omit<Document, "revisions"> & {
	revisions: string[];
} & MongooseDocument;

@Schema()
export class DocumentSchema {
	@Prop()
	id: string;
	@Prop()
	title: string;
	@Prop()
	revisions: string[];
	@Prop()
	schemaVersion: Version;
}

export const DocumentModel = SchemaFactory.createForClass(DocumentSchema);
