import { Model } from "mongoose";
import { AResult, ok } from "src/types/result";

import {
	AnyBlock,
	BlockType,
	Document,
	DocumentRevision,
} from "@dedit/models/dist/v1";
import { Injectable, Logger } from "@nestjs/common";
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
import { ErrorKind } from "./errors";

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

	findManyRaw(): Promise<DocumentWithIds[]> {
		return this.documentModel.find().exec();
	}
	findOneRaw(id: string): Promise<DocumentWithIds> {
		return this.documentModel.findOne({ id }).exec();
	}

	async create(document: Document): AResult<Document, ErrorKind> {
		await this.documentModel
			.create(document)
			.then((document) => document.save());
		return ok(document);
	}

	async update(id: string, update: Partial<Document>): Promise<string> {
		if (!(await this.documentModel.findOne({ id }))) {
			throw new Error(`Document ${id} not found`);
		}
		await this.documentModel.findOneAndUpdate({ id }, update);
		return id;
	}

	/**
	 * Recursively looks up a document.
	 * @param id
	 */
	async constructDocument(id: string): Promise<Document> {
		Logger.log(`Constructing document ${id}`);
		const root = await this.documentModel.findOne({ id });
		if (!root) {
			throw new Error(`Document ${id} not found`);
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
