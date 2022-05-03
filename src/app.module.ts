import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DocumentModule } from "./document/document.module";
import { GatewayModule } from "./gateway/gateway.module";

@Module({
	imports: [
		DocumentModule,
		MongooseModule.forRoot("mongodb://localhost/dedit"),
		GatewayModule,
	],
})
export class AppModule {}
