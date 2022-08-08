import {
	PrismaClientKnownRequestError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError,
} from "@prisma/client/runtime";

/**
 * Union of returnable Prisma error types.
 */
export type PrismaError =
	| PrismaClientValidationError
	| PrismaClientKnownRequestError
	| PrismaClientUnknownRequestError;
