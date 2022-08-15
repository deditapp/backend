import { FirebaseService } from "src/services/firebase.service";
import { PrismaService } from "src/services/prisma.service";
import { UserService } from "src/services/user.service";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DocumentsControllerV1 } from "./controllers/v1/documents.controller";
import { RevisionsControllerV1 } from "./controllers/v1/revisions.controller";
import { BlocksService } from "./services/blocks.service";
import { DocumentsService } from "./services/documents.service";
import { RevisionsService } from "./services/revisions.service";

@Module({
	imports: [ConfigModule],
	controllers: [DocumentsControllerV1, RevisionsControllerV1],
	providers: [
		BlocksService,
		DocumentsService,
		FirebaseService,
		PrismaService,
		RevisionsService,
		UserService,
	],
})
export class DocumentsModule {}
