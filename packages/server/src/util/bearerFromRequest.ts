import { Request } from "express";

/**
 * Extract a bearer token from a request.
 * @param req The request.
 * @returns The bearer token, if it exists.
 */
export const bearerFromRequest = (req: Request) => {
	const auth = req.headers.authorization;
	if (auth) {
		const [, token] = auth.split(" ");
		return token;
	}
	return null;
};
