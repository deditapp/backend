import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DocumentController } from "./document.controller";
import { RootBlockSchema } from "./schemas/block.schema";
import { DocumentSchema } from "./schemas/document.schema";
import { DocumentRevisionSchema } from "./schemas/revision.schema";
import { DocumentService } from "./services/document.service";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: DocumentSchema.name, schema: DocumentSchema },
			{ name: DocumentRevisionSchema.name, schema: DocumentRevisionSchema },
			{ name: RootBlockSchema.name, schema: RootBlockSchema },
		]),
	],
	controllers: [DocumentController],
	providers: [DocumentService],
})
export class DocumentModule {}
