import { DateTime } from "luxon";
import { PrismaService } from "src/services/prisma.service";
import { AResult, ok } from "src/types/result";

import { Injectable } from "@nestjs/common";
import { DocumentRevision } from "@prisma/client";

@Injectable()
export class RevisionService {
	constructor(private readonly prisma: PrismaService) {}
	/**
	 * Fetch revisions for the document with the given ID.
	 * @param documentId The document ID.
	 * @returns The revisions, if they are found.
	 */
	async revisions(documentId: string): AResult<DocumentRevision[], unknown>;
	/**
	 * Fetch revisions for the document with the given ID, filtering by creation date.
	 * @param documentId The document ID.
	 * @param before The date before which to filter.
	 * @param after The date after which to filter.
	 * @returns The revisions, if they are found.
	 */
	async revisions(
		documentId: string,
		before: DateTime,
		after?: DateTime
	): AResult<DocumentRevision[], unknown>;
	// method impl
	async revisions(
		documentId: string,
		before?: DateTime,
		after?: DateTime
	): AResult<DocumentRevision[], unknown> {
		return ok(
			await this.prisma.documentRevision.findMany({
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
}
