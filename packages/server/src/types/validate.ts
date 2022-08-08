import { ObjectSchema, ValidationError } from "joi";

import { intoResult } from "./result";

/**
 * Validate a value with a schema.
 * @param schema The schema.
 * @param value The value
 * @returns A `Result<T, ValidationError>`.
 */
export const validate = async <T>(schema: ObjectSchema, value: any) =>
	intoResult<T, ValidationError>(schema.validateAsync(value));
