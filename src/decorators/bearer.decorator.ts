import { bearerFromRequest } from "src/util/bearerFromRequest";

import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Extracts the bearer token from the request.
 */
export const Bearer = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	// extract the bearer token from the request
	const token = bearerFromRequest(request);
	if (!token) {
		return false;
	}
	return token;
});
