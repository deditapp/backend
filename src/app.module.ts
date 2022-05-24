import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DocumentModule } from "./document/document.module";

@Module({
	imports: [
		DocumentModule,
		MongooseModule.forRoot("mongodb://localhost/dedit"),
	],
})
export class AppModule {}
