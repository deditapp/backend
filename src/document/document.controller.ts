import type { Document } from "@dedit/models/dist/v1";
import { Controller, Get, Param, Patch, Post } from "@nestjs/common";

import { DocumentService } from "./services/document.service";

@Controller({ path: "/documents" })
export class DocumentController {
	constructor(private readonly documentService: DocumentService) {}

	@Get()
	async findMany(): Promise<Document[]> {
		// lookup raw documents
		const documents = await this.documentService
			.findManyRaw()
			.then((documents) =>
				// for each found document, construct it
				documents.map((document) =>
					this.documentService.constructDocument(document.id)
				)
			);
		return Promise.all(documents);
	}

	@Get(":id")
	findOne(@Param("id") id: string): Promise<Document> {
		return this.documentService.constructDocument(id);
	}

	@Post(":id")
	async create(@Param("id") id: string, document: Document): Promise<string> {
		await this.documentService.create({ ...document, id });
		return id;
	}

	@Patch(":id")
	async update(
		@Param("id") id: string,
		update: Partial<Document>
	): Promise<string> {
		await this.documentService.update(id, update);
		return id;
	}
}
