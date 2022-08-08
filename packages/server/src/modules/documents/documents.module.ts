import { FirebaseService } from "src/services/firebase.service";
import { PrismaService } from "src/services/prisma.service";
import { UserService } from "src/services/user.service";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DocumentsControllerV1 } from "./documents.controller";
import { BlockService } from "./services/block.service";
import { DocumentService } from "./services/document.service";

@Module({
	imports: [ConfigModule],
	controllers: [DocumentsControllerV1],
	providers: [DocumentService, BlockService, PrismaService, UserService, FirebaseService],
})
export class DocumentsModule {}
