import type { Document } from "@dedit/models/dist/v1";
import { Bearer } from "src/decorators/bearer.decorator";
import { AuthenticatedGuard } from "src/guards/AuthenticatedGuard";
import { DocumentGuard } from "src/guards/DocumentGuard";
import { IntoUser } from "src/pipes/into-user.pipe";
import { UserService } from "src/services/user.service";

import {
	Controller,
	Get,
	NotFoundException,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { User } from "@prisma/client";

import { DocumentService } from "./services/document.service";

@Controller({ path: "/documents", version: "1" })
@UseGuards(AuthenticatedGuard)
export class DocumentsControllerV1 {
	constructor(
		private readonly users: UserService,
		private readonly documents: DocumentService
	) {}

	@Get()
	async findMany(@Bearer(IntoUser) user: User): Promise<Document[]> {
		// lookup raw documents
		const documents = await this.documents.documentsByOwner(user.id);
		// if error, throw it
		if (documents.isErr()) {
			throw documents.unwrapErr();
		}
		return documents.unwrap();
	}

	@Get(":documentId")
	@UseGuards(DocumentGuard)
	async findOne(
		@Bearer(IntoUser) user: User,
		@Param("documentId") id: string
	): Promise<Document> {
		const document = await this.users.fetchOwnedDocument(user.id, id);
		if (!document) {
			throw new NotFoundException();
		}
		return document;
	}

	@Post()
	async create(): Promise<string> {
		const result = await this.documents.create(
			"00000000-0000-0000-0000-000000000000"
		);
		return result.unwrap();
	}

	@Patch(":documentId")
	async update(
		@Param("documentId") id: string,
		update: Partial<Document>
	): Promise<string> {
		// await this.documentService.update(id, update);
		return id;
	}
}
