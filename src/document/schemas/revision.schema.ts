import { Document } from "mongoose";

import { DocumentRevision } from "@dedit/models/src/v1";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { BlockSchema } from "./block.schema";

type IDocumentRevision = Document & DocumentRevision;

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
