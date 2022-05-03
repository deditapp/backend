import { Model } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import {
	DocumentRevisionSchema,
	IDocumentRevision,
} from "../schemas/revision.schema";

@Injectable()
export class RevisionService {
	constructor(
		@InjectModel(DocumentRevisionSchema.name)
		private readonly revisionModel: Model<IDocumentRevision>
	) {}
}
