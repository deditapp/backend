import type { Document } from "@dedit/models/src/v1";
import { Controller, Get, Param } from "@nestjs/common";

import { DocumentService } from "./services/document.service";

@Controller({ path: "/documents" })
export class DocumentController {
	constructor(private readonly documentService: DocumentService) {}

	@Get()
	findMany(): Promise<Document[]> {
		return this.documentService.findManyRaw();
	}

	@Get(":id")
	findOne(@Param("id") id: string): Promise<Document> {
		return this.documentService.findOneRaw(id);
	}
}
