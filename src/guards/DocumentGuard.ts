import { Request } from "express";
import { UserService } from "src/services/user.service";
import { bearerFromRequest } from "src/util/bearerFromRequest";

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

/**
 * Protects routes from unauthenticated users, and ensures the user has access to the route.
 * This guard implies `AuthenticatedGuard`.
 */
@Injectable()
export class DocumentGuard implements CanActivate {
	constructor(private readonly users: UserService) {}

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const request: Request = ctx.switchToHttp().getRequest();
		// extract the bearer token from the request
		const token = bearerFromRequest(request);
		if (!token) {
			return false;
		}
		// get the user
		const user = await this.users.fetchUserFromToken(token);
		if (!user) {
			return false;
		}
		// check if the user has access to the document
		const documentId = request.params["documentId"];
		return this.users.canAccessDocument(user.id, documentId);
	}
}
