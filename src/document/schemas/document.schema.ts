import type { BlockType, Document as IDocument } from "@dedit/models/src/v1";
import type { Version } from "@dedit/models/src/version";
import mongoose from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type IDocumentDocument = IDocument & Document;

@Schema()
export class DocumentModel {
	@Prop()
	id: string;
	@Prop()
	title: string;
	@Prop()
	revisions: DocumentRevision[];
	@Prop()
	schemaVersion: Version;
}

@Schema()
export class GenericBlock {
	@Prop()
	type: BlockType;
	@Prop({ type: {} })
	data: any;
	@Prop()
	children: GenericBlock[];
}

@Schema()
export class DocumentRevision {
	@Prop()
	children: GenericBlock[];
	@Prop()
	subtitle: string;
	@Prop()
	createdAt: number;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentModel);
