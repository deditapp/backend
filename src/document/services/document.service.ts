import { Model } from "mongoose";

import {
	AnyBlock,
	BlockType,
	Document,
	DocumentRevision,
} from "@dedit/models/src/v1";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { IRootBlock, RootBlockSchema } from "../schemas/block.schema";
import {
	DocumentSchema,
	DocumentWithIds,
	IDocument,
} from "../schemas/document.schema";
import {
	DocumentRevisionSchema,
	IDocumentRevision,
} from "../schemas/revision.schema";

@Injectable()
export class DocumentService {
	constructor(
		@InjectModel(DocumentSchema.name)
		private readonly documentModel: Model<IDocument>,
		@InjectModel(RootBlockSchema.name)
		private readonly rootBlockSchema: Model<IRootBlock>,
		@InjectModel(DocumentRevisionSchema.name)
		private readonly revisionModel: Model<IDocumentRevision>
	) {}

	async findManyRaw(): Promise<DocumentWithIds[]> {
		return this.documentModel.find().exec();
	}
	findOneRaw(id: string): Promise<DocumentWithIds> {
		return this.documentModel.findOne({ id }).exec();
	}

	/**
	 * Recursively looks up a document.
	 * @param id
	 */
	async constructDocument(id: string): Promise<Document> {
		const root = await this.documentModel.findOne({ id });
		if (!root) {
			return;
		}
		// look up revisions
		const revisions = (await this.revisionModel.find({
			id: { $in: root.revisions },
		})) as DocumentRevision[];
		const resolvedRevisions = await Promise.all(
			revisions.map((revision) => this.constructBlock(revision))
		);
		return {
			...root,
			revisions: resolvedRevisions,
		};
	}

	/*
	 * Recursively constructs a block tree.
	 * @param block The root block.
	 * @returns
	 */
	async constructBlock<T extends AnyBlock | DocumentRevision>(
		block: T
	): Promise<T> {
		// look up references and replace
		if (block.type === BlockType.Ref) {
			block = await this.rootBlockSchema.findOne({
				id: block.data.id,
			});
		}
		// recursively construct children of blocks
		if ("children" in block) {
			block.children = await Promise.all(
				block.children.map((child: AnyBlock) => this.constructBlock(child))
			);
		}
		return block;
	}
}
