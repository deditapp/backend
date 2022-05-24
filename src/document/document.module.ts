import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DocumentController } from "./document.controller";
import { RootBlockModel, RootBlockSchema } from "./schemas/block.schema";
import { DocumentModel, DocumentSchema } from "./schemas/document.schema";
import {
	DocumentRevisionModel,
	DocumentRevisionSchema,
} from "./schemas/revision.schema";
import { DocumentService } from "./services/document.service";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: DocumentSchema.name, schema: DocumentModel },
			{ name: DocumentRevisionSchema.name, schema: DocumentRevisionModel },
			{ name: RootBlockSchema.name, schema: RootBlockModel },
		]),
	],
	controllers: [DocumentController],
	providers: [DocumentService],
})
export class DocumentModule {}
