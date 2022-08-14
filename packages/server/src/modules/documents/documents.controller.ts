import type { RootBlock } from "@dedit/models/dist/v1";
import { Bearer } from "src/decorators/bearer.decorator";
import { AuthenticatedGuard } from "src/guards/AuthenticatedGuard";
import { DocumentGuard } from "src/guards/DocumentGuard";
import { IntoUser } from "src/pipes/into-user.pipe";
import { UserService } from "src/services/user.service";

import {
	Body,
	Controller,
	Get,
	NotFoundException,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { User } from "@prisma/client";

import {
	DocumentDto,
	RootBlockDto,
	UpdateDocumentPayloadDto,
	UpdateRootBlockDto,
} from "./documents.dto";
import { DocumentService } from "./services/document.service";

@Controller({ path: "/documents", version: "1" })
@UseGuards(AuthenticatedGuard)
export class DocumentsControllerV1 {
	constructor(private readonly users: UserService, private readonly documents: DocumentService) {}

	@Get()
	@ApiResponse({ type: [DocumentDto] })
	async findMany(@Bearer(IntoUser) user: User): Promise<DocumentDto[]> {
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
	@ApiResponse({ type: DocumentDto })
	async findOne(
		@Bearer(IntoUser) user: User,
		@Param("documentId") id: string
	): Promise<DocumentDto> {
		const document = await this.users.fetchOwnedDocument(user.id, id);
		if (!document) {
			throw new NotFoundException();
		}
		return {
			...document,
			createdAt: document.createdAt.toISOString(),
			updatedAt: document.updatedAt.toISOString(),
		};
	}

	@Post()
	@ApiResponse({ status: 200, type: DocumentDto })
	async create(): Promise<DocumentDto> {
		const result = await this.documents.create("00000000-0000-0000-0000-000000000000");
		if (result.isErr()) {
			throw result.unwrapErr();
		}
		const documentResult = await this.documents.document(result.unwrap());
		if (documentResult.isErr()) {
			throw documentResult.unwrapErr();
		}
		const document = documentResult.unwrap();
		if (!document) {
			throw new NotFoundException();
		}
		return document;
	}

	@Patch(":documentId")
	@ApiResponse({ status: 200, type: DocumentDto })
	async update(
		@Param("documentId") id: string,
		@Body() update: UpdateDocumentPayloadDto
	): Promise<DocumentDto> {
		const result = await this.documents.update(id, { ...update, id });
		if (result.isErr()) {
			throw result.unwrapErr();
		}
		const documentResult = await this.documents.document(id);
		if (documentResult.isErr()) {
			throw documentResult.unwrapErr();
		}
		const document = documentResult.unwrap();
		if (!document) {
			throw new NotFoundException();
		}
		return document;
	}

	@Get(":documentId/content")
	@ApiResponse({ status: 200, type: RootBlockDto })
	async fetchDocumentContent(@Param() id: string): Promise<RootBlock> {
		const result = await this.documents.fetchContent(id);
		if (result.isErr()) {
			throw result.unwrapErr();
		}
		return result.unwrap();
	}

	@Patch(":documentId/content")
	@ApiResponse({ status: 200, type: RootBlockDto })
	async updateDocumentContent(
		@Param("documentId") id: string,
		@Body() update: UpdateRootBlockDto
	): Promise<RootBlock> {
		const updateResult = await this.documents.updateContent(id, update);
		if (updateResult.isErr()) {
			throw updateResult.unwrapErr();
		}
		const rootBlock = (await this.documents.fetchContent(id)).unwrap();
		if (!rootBlock) {
			throw new NotFoundException();
		}
		return rootBlock;
	}
}
