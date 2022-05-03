import { Document } from "mongoose";

import { BlockType, RootBlock } from "@dedit/models/src/v1";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type IRootBlock = Document & RootBlock;

@Schema()
export class BlockSchema {
	@Prop()
	type: BlockType;
	@Prop({ type: {} })
	data: any;
	@Prop()
	children: BlockSchema[];
}

@Schema()
export class RootBlockSchema {
	@Prop()
	id: string;
	@Prop()
	type: BlockType;
	@Prop()
	children: BlockSchema[];
}

export const RootBlockModel = SchemaFactory.createForClass(RootBlockSchema);
