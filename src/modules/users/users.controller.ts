import * as Joi from "joi";
import { Bearer } from "src/decorators/bearer.decorator";
import { AuthenticatedGuard } from "src/guards/AuthenticatedGuard";
import { IntoUser } from "src/pipes/into-user.pipe";
import { JoiValidationPipe } from "src/pipes/joi-validate.pipe";
import { UserService } from "src/services/user.service";

import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";

interface LoginPayload {
	email: string;
}

const LoginPayloadSchema = Joi.object({
	email: Joi.string().required(),
});

@Controller({ version: "1" })
export class UsersControllerV1 {
	constructor(private readonly users: UserService) {}

	@UseGuards(AuthenticatedGuard)
	@Get("/me")
	async me(@Bearer(IntoUser) user: User): Promise<User> {
		return user;
	}

	@Post("/login")
	async login(@Body(new JoiValidationPipe(LoginPayloadSchema)) { email }: LoginPayload) {
		return { location: this.users.generateLoginLink(email) };
	}

	@Post("/login/redirect")
	async finalizeLogin() {
		// TODO
	}
}
