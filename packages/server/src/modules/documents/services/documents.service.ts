import { DateTime } from "luxon";
import { MongoError } from "mongodb";
import { PrismaService } from "src/services/prisma.service";
import { PrismaError } from "src/types/errors";
import { AResult, intoResult, ok } from "src/types/result";

import { Document } from "@dedit/models/dist/v1";
import { Injectable, Logger } from "@nestjs/common";
import { Document as PrismaDocument } from "@prisma/client";

import { BlocksService } from "./blocks.service";

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
export class DocumentsService {
	private readonly logger = new Logger(DocumentsService.name);

	constructor(private readonly blocks: BlocksService, private readonly prisma: PrismaService) {}

	/**
	 * Fetch a document by its ID.
	 * @param id The document ID.
	 * @returns The document, if it is found.
	 */
	async getDocument(id: string): AResult<Document | undefined, unknown> {
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
	async getDocumentsByOwner(ownerId: string): AResult<Document[], PrismaError> {
		this.logger.verbose(`Fetch documents by owner ${ownerId}`);
		return await this.getDocuments({ ownerId });
	}

	/**
	 * Fetch documents by the query.
	 * @param query The query.
	 * @param options The options.
	 * @returns The documents, if they are found.
	 */
	async getDocuments(query: Partial<DocumentQuery> = {}): AResult<Document[], PrismaError> {
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
	async createDocument(ownerId: string): AResult<Document, MongoError | PrismaError> {
		this.logger.verbose("Create new document");
		// create new root block
		const blockCreateResult = await this.blocks.createEmpty();
		if (blockCreateResult.isErr()) {
			return blockCreateResult;
		}
		const blockId = blockCreateResult.unwrap();
		// create document and first document revision
		const documentCreateResult = await intoResult<PrismaDocument, PrismaError>(
			this.prisma.document.create({
				data: {
					owner: { connect: { id: ownerId } },
					revisions: { create: [{ blockId }] },
				},
			})
		);
		// if failed to perform query
		if (documentCreateResult.isErr()) {
			return documentCreateResult;
		}
		return ok(prismaDocToDoc(documentCreateResult.unwrap()));
	}

	/**
	 * Update a document with the given ID.
	 * @param id The document ID.
	 * @param payload The update payload
	 * @returns The upgraded document
	 */
	async updateDocument(id: string, payload: Document): AResult<Document, Error> {
		this.logger.verbose(`Update document ${id}`);
		return intoResult<Document, Error>(
			this.prisma.document
				.update({
					where: { id },
					data: {
						...payload,
						updatedAt: new Date().toISOString(),
					},
				})
				.then((doc) => prismaDocToDoc(doc))
		);
	}

	/**
	 * Delete a document with the given ID.
	 * @param id The ID of the document.
	 * @returns The ID of the deleted document.
	 */
	async deleteDocument(id: string): AResult<string, Error> {
		return intoResult(
			this.prisma.document
				.delete({
					where: { id },
				})
				.then((doc) => doc.id)
		);
	}
}
