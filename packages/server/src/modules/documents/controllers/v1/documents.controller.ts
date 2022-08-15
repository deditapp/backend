import { Bearer } from "src/decorators/bearer.decorator";
import { AuthenticatedGuard } from "src/guards/AuthenticatedGuard";
import { DocumentGuard } from "src/guards/DocumentGuard";
import { IntoUser } from "src/pipes/into-user.pipe";
import { UserService } from "src/services/user.service";

import { Document } from "@dedit/models/dist/v1";
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
import { ApiBody, ApiProperty, ApiPropertyOptional, ApiResponse } from "@nestjs/swagger";
import { User } from "@prisma/client";

import { DocumentsService } from "../../services/documents.service";

export class DocumentDto implements Document {
	@ApiProperty()
	id!: string;
	@ApiProperty()
	title!: string;
	@ApiProperty()
	tags!: string[];
	@ApiProperty()
	createdAt!: string;
	@ApiProperty()
	updatedAt!: string;
	@ApiProperty()
	ownerId!: string;
}

export class UpdateDocumentPayloadDto implements Partial<Document> {
	@ApiPropertyOptional()
	title!: string;
	@ApiPropertyOptional()
	tags!: string[];
	@ApiPropertyOptional()
	createdAt!: string;
	@ApiPropertyOptional()
	updatedAt!: string;
	@ApiPropertyOptional()
	ownerId!: string;
}

@Controller({ path: "/documents", version: "1" })
@UseGuards(AuthenticatedGuard)
export class DocumentsControllerV1 {
	constructor(private readonly users: UserService, private readonly documents: DocumentsService) {}

	@Get()
	@ApiResponse({ type: [DocumentDto] })
	async getDocumentsForUser(@Bearer(IntoUser) user: User): Promise<DocumentDto[]> {
		// lookup raw documents
		const documents = await this.documents.getDocumentsByOwner(user.id);
		// if error, throw it
		if (documents.isErr()) {
			throw documents.unwrapErr();
		}
		return documents.unwrap();
	}

	@Get(":documentId")
	@UseGuards(DocumentGuard)
	@ApiResponse({ type: DocumentDto })
	async getDocument(
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
	@ApiResponse({ status: 200, type: DocumentDto, description: "Returns the new document." })
	@ApiResponse({
		status: 500,
		description: "An internal server error occurred while creating the new document.",
	})
	async createDocument(): Promise<DocumentDto> {
		const result = await this.documents.createDocument("00000000-0000-0000-0000-000000000000");
		if (result.isErr()) {
			throw result.unwrapErr();
		}
		return result.unwrap();
	}

	@Patch(":documentId")
	@ApiResponse({ status: 200, type: DocumentDto, description: "Returns the updated document." })
	@ApiResponse({
		status: 500,
		description: "An internal server error occurred while updating the document.",
	})
	@ApiBody({ type: UpdateDocumentPayloadDto })
	async updateDocument(
		@Param("documentId") id: string,
		@Body() update: UpdateDocumentPayloadDto
	): Promise<DocumentDto> {
		const result = await this.documents.updateDocument(id, { ...update, id });
		if (result.isErr()) {
			throw result.unwrapErr();
		}
		const documentResult = await this.documents.getDocument(id);
		if (documentResult.isErr()) {
			throw documentResult.unwrapErr();
		}
		const document = documentResult.unwrap();
		if (!document) {
			throw new NotFoundException();
		}
		return document;
	}
}
