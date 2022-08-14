import { DateTime } from "luxon";
import { MongoError } from "mongodb";
import { PrismaService } from "src/services/prisma.service";
import { PrismaError } from "src/types/errors";
import { AResult, err, intoResult, ok } from "src/types/result";
import { DeepPartial } from "src/types/utils";

import { Document, RootBlock } from "@dedit/models/dist/v1";
import { Injectable, Logger } from "@nestjs/common";
import { Document as PrismaDocument } from "@prisma/client";

import { BlockService } from "./block.service";

interface DocumentQuery {
	id: string | string[];
	before: DateTime;
	after: DateTime;
	limit: number;
	ownerId: string | string[];
	title: string;
	tags: string[];
}

const prismaDocToDoc = (doc: PrismaDocument | PrismaDocument[]) =>
	Array.isArray(doc)
		? doc.map(prismaDocToDoc)
		: ({
				...doc,
				createdAt: doc.createdAt.toISOString(),
				updatedAt: doc.updatedAt.toISOString(),
		  } as Document);

@Injectable()
export class DocumentService {
	private readonly logger = new Logger(DocumentService.name);

	constructor(private readonly blocks: BlockService, private readonly prisma: PrismaService) {}

	/**
	 * Fetch a document by its ID.
	 * @param id The document ID.
	 * @returns The document, if it is found.
	 */
	async document(id: string): AResult<Document | undefined, unknown> {
		this.logger.verbose(`Fetch document ${id}`);

		const document = await this.prisma.document.findFirst({
			where: { id },
			include: { revisions: true },
		});

		if (!document) {
			return ok(undefined);
		}

		return ok(document).map(prismaDocToDoc);
	}

	/**
	 * Fetch documents by the ID of their owner.
	 * @param ownerId The ID of the owner.
	 * @returns The documents, if they are found.
	 */
	async documentsByOwner(ownerId: string): AResult<Document[], PrismaError> {
		this.logger.verbose(`Fetch documents by owner ${ownerId}`);
		return await this.documents({ ownerId });
	}

	/**
	 * Fetch documents by the query.
	 * @param query The query.
	 * @param options The options.
	 * @returns The documents, if they are found.
	 */
	async documents(query: Partial<DocumentQuery> = {}): AResult<Document[], PrismaError> {
		return (
			await intoResult<PrismaDocument[], PrismaError>(
				this.prisma.document.findMany({
					where: {
						...query,
						ownerId: query.ownerId instanceof Array ? { in: query.ownerId } : query.ownerId,
						id: query.id instanceof Array ? { in: query.id } : query.id,
						createdAt: {
							lte: query.after?.toISO(),
							gte: query.before?.toISO(),
						},
						tags: { hasEvery: query.tags },
					},
				})
			)
		).map(prismaDocToDoc);
	}

	/**
	 * Create a new document.
	 * @param ownerId The ID of the owner.
	 */
	async create(ownerId: string): AResult<string, MongoError | PrismaError> {
		this.logger.verbose("Create new document");
		// create new root block
		const blockCreateResult = await this.blocks.create();
		if (blockCreateResult.isErr()) {
			return blockCreateResult;
		}
		const blockId = blockCreateResult.unwrap();
		// create document and first document revision
		const documentCreateResult = await intoResult<PrismaDocument, PrismaError>(
			this.prisma.document.create({
				data: {
					ownerId,
					revisions: { create: [{ blockId }] },
				},
			})
		);
		// if failed to perform query
		if (documentCreateResult.isErr()) {
			return documentCreateResult;
		}
		const { id: documentId } = documentCreateResult.unwrap();
		// append to user
		const userAppendResult = await intoResult<any, PrismaError>(
			this.prisma.user.update({
				where: { id: ownerId },
				data: {
					documents: {
						connect: { id: documentId },
					},
				},
			})
		);
		// if operation failed
		if (userAppendResult.isErr()) {
			return userAppendResult;
		}
		return ok(documentId);
	}

	async update(id: string, payload: Document): AResult<true, Error> {
		this.logger.verbose(`Update document ${id}`);
		return await intoResult<true, Error>(
			this.prisma.document
				.update({
					where: { id },
					data: {
						...payload,
						updatedAt: new Date().toISOString(),
					},
				})
				.then(() => true)
		);
	}

	/**
	 * Fetch the root block of a document.
	 * @param id The ID of the document.
	 * @returns
	 */
	async fetchContent(id: string): AResult<RootBlock, Error> {
		const result = await this.blocks.tree(id);
		if (result.isErr()) {
			return result;
		}
		const root = result.unwrap();
		if (!root) {
			return err(new Error("No root block found"));
		}
		return ok(root);
	}

	/**
	 * Update the content of a document.
	 * @param id The ID of the document.
	 * @param payload The new content.
	 * @returns True if the operation succeeded.
	 */
	async updateContent(id: string, payload: DeepPartial<RootBlock>): AResult<true, Error> {
		return (await this.blocks.update(id, payload)).map((_) => true);
	}
}
