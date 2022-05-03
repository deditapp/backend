import type { Document } from "@dedit/models/src/v1";
import type { Version } from "@dedit/models/src/version";

import { Document as MongooseDocument } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/**
 * A utility type representing a stored document.
 */
export type DocumentWithIds = Omit<Document, "revisions"> & {
	revisions: string[];
};

// omit the revision field as this is stored in a separate model.
export type IDocument = DocumentWithIds & MongooseDocument;

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
