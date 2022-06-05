import { PrismaService } from "src/services/prisma.service";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DocumentController } from "./document.controller";
import { BlockService } from "./services/block.service";
import { DocumentService } from "./services/document.service";

@Module({
	imports: [ConfigModule],
	controllers: [DocumentController],
	providers: [DocumentService, BlockService, DocumentService, PrismaService],
})
export class DocumentModule {}
