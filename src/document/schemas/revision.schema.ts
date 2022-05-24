import { Document } from "mongoose";

import { DocumentRevision } from "@dedit/models/dist/v1";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { BlockSchema } from "./block.schema";

export type IDocumentRevision = Document & DocumentRevision;

@Schema()
export class DocumentRevisionSchema {
	@Prop()
	children: BlockSchema[];
	@Prop()
	subtitle: string;
	@Prop()
	createdAt: number;
}

export const DocumentRevisionModel = SchemaFactory.createForClass(
	DocumentRevisionSchema
);
