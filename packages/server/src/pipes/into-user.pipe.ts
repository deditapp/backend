import { UserService } from "src/services/user.service";

import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { User } from "@prisma/client";

export class IntoUser implements PipeTransform<string, User> {
	constructor(private readonly users: UserService) {}

	transform(value: string, _metadata: ArgumentMetadata) {
		return this.users.fetchUserFromToken(value) as unknown as User;
	}
}
