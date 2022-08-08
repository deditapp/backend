import { writeFile } from "fs/promises";
import { resolve } from "path";
import * as process from "process";

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "../src/app.module";

// swagger configuration
const config = new DocumentBuilder()
	.setTitle("Dedit API")
	.setDescription("The API for interfacing with Dedit services.")
	.setVersion("1")
	.build();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	// set app options
	app.enableVersioning();
	// create swagger document
	const document = SwaggerModule.createDocument(app, config);
	await writeFile(resolve(process.cwd(), "swagger.json"), JSON.stringify(document));
}
bootstrap();
