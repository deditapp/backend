import type { Document } from "@dedit/models/dist/v1";
import { Controller, Get, Param, Patch, Post } from "@nestjs/common";

import { DocumentService } from "./services/document.service";

@Controller({ path: "/documents" })
export class DocumentController {
	constructor(private readonly documentService: DocumentService) {}

	@Get()
	async findMany(): Promise<Document[]> {
		// lookup raw documents
		const documents = await this.documentService.documentsByOwner(
			"00000000-0000-0000-0000-000000000000"
		);
		// if error, throw it
		if (documents.isErr()) {
			throw documents.unwrapErr();
		}
		return documents.unwrap();
	}

	@Get(":id")
	async findOne(@Param("id") id: string): Promise<Document> {
		return (await this.documentService.document(id)).unwrap();
	}

	@Post()
	async create(): Promise<string> {
		const result = await this.documentService.create(
			"00000000-0000-0000-0000-000000000000"
		);
		return result.unwrap();
	}

	@Patch(":id")
	async update(
		@Param("id") id: string,
		update: Partial<Document>
	): Promise<string> {
		// await this.documentService.update(id, update);
		return id;
	}
}
