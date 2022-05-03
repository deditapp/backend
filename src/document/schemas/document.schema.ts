import type { BlockType, Document } from "@dedit/models/src/v1";
import type { Version } from "@dedit/models/src/version";

import { Document as MongooseDocument } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { DocumentRevisionSchema } from "./revision.schema";

export type IDocument = Document & MongooseDocument;

@Schema()
export class DocumentSchema {
	@Prop()
	id: string;
	@Prop()
	title: string;
	@Prop()
	revisions: DocumentRevisionSchema[];
	@Prop()
	schemaVersion: Version;
}

export const DocumentModel = SchemaFactory.createForClass(DocumentSchema);
