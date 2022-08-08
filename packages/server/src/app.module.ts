import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DocumentsModule } from "./modules/documents/documents.module";
import { UsersModule } from "./modules/users/users.module";
import { PrismaService } from "./services/prisma.service";

@Module({
	imports: [DocumentsModule, UsersModule, ConfigModule],
	providers: [PrismaService],
})
export class AppModule {}
