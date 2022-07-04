import { PrismaService } from "src/services/prisma.service";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DocumentsControllerV1 } from "./documents.controller";
import { BlockService } from "./services/block.service";
import { DocumentService } from "./services/document.service";

@Module({
	imports: [ConfigModule],
	controllers: [DocumentsControllerV1],
	providers: [DocumentService, BlockService, PrismaService],
})
export class DocumentsModule {}
