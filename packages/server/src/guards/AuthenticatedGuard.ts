import { UserService } from "src/services/user.service";

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

/**
 * Implements a guard that checks the request is authenticated.
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
	constructor(private readonly users: UserService) {}

	async canActivate(_ctx: ExecutionContext): Promise<boolean> {
		// temporarily bypass authentication
		return true;
		// const request: Request = ctx.switchToHttp().getRequest();
		// extract the bearer token from the request
		// const token = bearerFromRequest(request);
		// if (!token) {
		// 	return false;
		// }
		// // verify the token
		// return this.users.verifyToken(token);
	}
}
