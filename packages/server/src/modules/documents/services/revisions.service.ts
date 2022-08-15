import { DateTime } from "luxon";
import { PrismaService } from "src/services/prisma.service";
import { PrismaError } from "src/types/errors";
import { AResult, intoResult } from "src/types/result";

import { Injectable } from "@nestjs/common";
import { DocumentRevision } from "@prisma/client";

@Injectable()
export class RevisionsService {
	constructor(private readonly prisma: PrismaService) {}
	/**
	 * Fetch revisions for the document with the given ID.
	 * @param documentId The document ID.
	 * @returns The revisions, if they are found.
	 */
	async getRevisions(documentId: string): AResult<DocumentRevision[], unknown>;
	/**
	 * Fetch revisions for the document with the given ID, filtering by creation date.
	 * @param documentId The document ID.
	 * @param before The date before which to filter.
	 * @param after The date after which to filter.
	 * @returns The revisions, if they are found.
	 */
	async getRevisions(
		documentId: string,
		before: DateTime,
		after?: DateTime
	): AResult<DocumentRevision[], PrismaError>;
	// method impl
	async getRevisions(
		documentId: string,
		before?: DateTime,
		after?: DateTime
	): AResult<DocumentRevision[], PrismaError> {
		return intoResult<DocumentRevision[], PrismaError>(
			this.prisma.documentRevision.findMany({
				where: {
					documentId,
					createdAt: {
						lte: before?.toISO(),
						gte: after?.toISO(),
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			})
		);
	}

	/**
	 * Get a revision by its ID.
	 * @param id The ID of the revision.
	 */
	async getRevision(id: string): AResult<DocumentRevision | null, PrismaError> {
		return intoResult<DocumentRevision | null, PrismaError>(
			this.prisma.documentRevision.findFirst({
				where: { id },
			})
		);
	}

	/**
	 * Get the latest revision for a given document.
	 * @param documentId The document ID
	 */
	async getLatestRevision(documentId: string): AResult<DocumentRevision, PrismaError> {
		return intoResult<DocumentRevision, PrismaError>(
			this.prisma.documentRevision.findFirst({
				where: {
					documentId,
				},
				orderBy: {
					createdAt: "desc",
				},
				// this should reject as there should always be a document revision for a given document.
				rejectOnNotFound: true,
			})
		);
	}

	/**
	 * Create a new revision for a given document.
	 * @param documentId The ID of the document.
	 * @param rootBlockId The ID of the revision's root block.
	 */
	async createRevision(
		documentId: string,
		rootBlockId: string
	): AResult<DocumentRevision, PrismaError> {
		return intoResult<DocumentRevision, PrismaError>(
			this.prisma.documentRevision.create({
				data: {
					documentId,
					blockId: rootBlockId,
				},
			})
		);
	}
}
