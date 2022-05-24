import { Module } from "@nestjs/common";

import { GatewayHandler } from "./gateway.handler";

@Module({
	providers: [GatewayHandler],
})
export class GatewayModule {}
