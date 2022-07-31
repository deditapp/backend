import { FirebaseService } from "src/services/firebase.service";
import { PrismaService } from "src/services/prisma.service";
import { UserService } from "src/services/user.service";

import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { UsersControllerV1 } from "./users.controller";

@Module({
	controllers: [UsersControllerV1],
	providers: [UserService, PrismaService, FirebaseService, ConfigService],
})
export class UsersModule {}
