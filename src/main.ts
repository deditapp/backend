import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { PrismaService } from "./services/prisma.service";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	// enable dev cors for local development
	if (process.env.NODE_ENV !== "production") {
		app.enableCors({ origin: "http://localhost:3000" });
	}
	// prevent shutdown hook issues
	const prismaService = app.get(PrismaService);
	await prismaService.enableShutdownHooks(app);

	await app.listen(8080);
}
bootstrap();
