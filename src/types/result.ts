/**
 * Rust-like result class.
 */
export class Result<T, E> {
	/**
	 * Create a success result.
	 */
	static ok<T, E>(value: T): Result<T, E> {
		return new Result(value);
	}
	/**
	 * Create an error result.
	 * @param err
	 * @returns
	 */
	static err<T, E>(err: E): Result<T, E> {
		return new Result(undefined, err);
	}

	private constructor(private readonly value?: T, private readonly error?: E) {}

	/**
	 * @returns True if the result is a success.
	 */
	isOk(): this is Result<E, never> {
		return this.value !== undefined;
	}

	/**
	 * @returns True if the result is an error.
	 */
	isErr(): this is Result<never, E> {
		return this.error !== undefined;
	}

	/**
	 * Unwrap the result.
	 */
	unwrap(): T {
		if (!this.isOk()) {
			throw new Error("Result is not ok");
		}
		return this.value;
	}

	/**
	 * Unwrap the result.
	 */
	unwrapErr(): E {
		if (!this.isErr()) {
			throw new Error("Result is not error");
		}
		return this.error;
	}

	map<U>(f: (value: T) => U): Result<U, E> {
		if (!this.isOk()) {
			return Result.err(this.unwrapErr());
		}
		return Result.ok(f(this.unwrap()));
	}

	mapErr<F>(f: (error: E) => F): Result<T, F> {
		if (!this.isErr()) {
			return Result.ok(this.unwrap());
		}
		return Result.err(f(this.unwrapErr()));
	}

	intoErr(): Result<never, E> {
		return Result.err(this.unwrapErr());
	}
}

/**
 * Asynchronous result type.
 */
export type AResult<T, E> = Promise<Result<T, E>>;

/**
 * Create an Ok result variant.
 * @param value The inner value.
 * @returns THe result variant.
 */
export const ok = <T, E>(value: T): Result<T, E> => Result.ok(value);

/**
 * Create an Err result variant.
 * @param value The inner value.
 * @returns THe result variant.
 */
export const err = <T, E>(err: E): Result<T, E> => Result.err(err);

/**
 * Create an async Ok result variant.
 * @param value The inner value.
 * @returns THe result variant.
 */
export const asyncOk = <T, E>(value: T): AResult<T, E> =>
	Promise.resolve(Result.ok(value));

/**
 * Create an async Err result variant.
 * @param value The inner value.
 * @returns THe result variant.
 */
export const asyncErr = <T, E>(err: E): AResult<T, E> =>
	Promise.resolve(Result.err(err));

/**
 * Convert a promise into an asynchronous result.
 * @param promise The promise to convert.
 * @returns
 */
export const intoResult = async <T, E>(promise: Promise<T>): AResult<T, E> => {
	try {
		const t = await promise;
		return ok(t) as Result<T, E>;
	} catch (e) {
		return err(e as E);
	}
};
