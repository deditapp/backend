import { Model } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { RootBlockSchema } from "../schemas/block.schema";

@Injectable()
export class BlockService {
	constructor(
		@InjectModel(RootBlockSchema.name)
		private readonly rootBlockModel: Model<IRootBlock>
	) {}
}
