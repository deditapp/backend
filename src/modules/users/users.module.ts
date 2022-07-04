import { Module } from "@nestjs/common";

import { UsersControllerV1 } from "./users.controller";

@Module({ controllers: [UsersControllerV1] })
export class UsersModule {}
