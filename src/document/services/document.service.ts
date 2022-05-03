import { Model } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { DocumentModel, IDocumentDocument } from "./schemas/document.schema";

import type { Document } from "@dedit/models/src/v1";

@Injectable()
export class DocumentService {
	constructor(
		@InjectModel(DocumentModel.name)
		private readonly documentModel: Model<IDocumentDocument>
	) {}

	async findManyRaw(): Promise<Document[]> {
		return this.documentModel.find().exec();
	}
	findOneRaw(id: string): Promise<Document> {
		return this.documentModel.findOne({ id }).exec();
	}

	/**
	 * Recursively looks up a document.
	 * @param id
	 */
	async recursiveFind(id: string): Promise<Document> {
		const root = (await this.documentModel.findOne({ id })) as Document;
		if (!root) {
			return;
		}
	}
}
