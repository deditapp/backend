import { ValidationError } from "joi";
import { MongoClient, MongoError } from "mongodb";
import { v4 as uuid } from "uuid";

import { BlockType, RootBlock } from "@dedit/models/dist/v1";
import { RootBlockSchema } from "@dedit/models/dist/v1/validation/block";
import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AResult, intoResult, ok } from "../../../types/result";
import { validate } from "../../../types/validate";

@Injectable()
export class BlockService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(BlockService.name);
	private readonly mongo = new MongoClient(
		this.config.getOrThrow("MONGODB_URL")
	);

	private get blocks() {
		return this.mongo.db("dedit").collection("blocks");
	}

	constructor(private readonly config: ConfigService) {}

	async onModuleInit() {
		this.logger.log("Connecting to MongoDB...");
		await this.mongo.connect();
		this.logger.log("Connected to MongoDB");
	}

	async onModuleDestroy() {
		this.logger.log("Disconnecting from MongoDB...");
		await this.mongo.close();
	}

	/**
	 * Fetch a root block with the given ID.
	 * @param id The root block ID.
	 * @returns The root block, if it is found.
	 */
	async block(
		id: string
	): AResult<RootBlock | undefined, MongoError | ValidationError> {
		const res = await intoResult<any, MongoError>(
			this.blocks.findOne({ _id: id })
		);
		// return error if failed
		if (res.isErr()) {
			return res;
		}
		// return undefined if not found
		if (res.isOk() && res.unwrap() === null) {
			return ok(undefined);
		}
		// return block if found
		return validate(RootBlockSchema, res.unwrap());
	}

	/**
	 * Fetch a root block and recursively build the document tree.
	 * @param id The root block ID.
	 * @returns The full document tree.
	 */
	async tree(
		id: string
	): AResult<RootBlock | undefined, MongoError | ValidationError> {
		const res = await this.block(id);
		if (res.isErr()) {
			return res;
		}
	}

	/**
	 * Create a new root block.
	 * @param block
	 * @returns
	 */
	async create(): AResult<string, MongoError> {
		const block: RootBlock = {
			id: uuid(),
			children: [],
			type: BlockType.Root,
			tags: [],
		};
		// insert into database
		const res = await intoResult<any, MongoError>(this.blocks.insertOne(block));
		if (res.isErr()) {
			return res;
		}
		return ok(block.id);
	}
}
