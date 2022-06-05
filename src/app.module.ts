import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DocumentModule } from "./modules/document/document.module";
import { PrismaService } from "./services/prisma.service";

@Module({
	imports: [DocumentModule, ConfigModule],
	providers: [PrismaService],
})
export class AppModule {}
