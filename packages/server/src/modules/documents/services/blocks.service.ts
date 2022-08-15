import { ValidationError } from "joi";
import { MongoClient, MongoError } from "mongodb";
import { v4 as uuid } from "uuid";

import { BlockType, RootBlock } from "@dedit/models/dist/v1";
import { RootBlockSchema } from "@dedit/models/dist/v1/validation/block";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AResult, intoResult, ok } from "../../../types/result";
import { validate } from "../../../types/validate";

/**
 * Payload type for `BlocksService.insertBlock`.
 */
export type PartialRootBlock = Omit<RootBlock, "id" | "type">;

@Injectable()
export class BlocksService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(BlocksService.name);
	private readonly mongo = new MongoClient(this.config.getOrThrow("MONGODB_URL"));

	/**
	 * Reference to the "blocks" collection.
	 */
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
	async getBlock(id: string): AResult<RootBlock | undefined, MongoError | ValidationError> {
		this.logger.log(`Fetching block ${id}...`);
		const res = await intoResult<any, MongoError>(this.blocks.findOne({ id }));
		// return error if failed
		if (res.isErr()) {
			return res;
		}
		// return undefined if not found
		if (res.isOk() && res.unwrap() === null) {
			return ok(undefined);
		}
		// return block if found
		this.logger.log("Validating block...");
		return validate(RootBlockSchema, res.unwrap());
	}

	/**
	 * Create an empty root block.
	 * @param block
	 * @returns
	 */
	async createEmpty(): AResult<string, MongoError> {
		this.logger.verbose("Creating new root block...");
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
		this.logger.verbose(`Created root block with ID ${block.id}`);
		return ok(block.id);
	}

	/**
	 * Insert the target block into the database.
	 * @param block The block to insert.
	 */
	async insertBlock(block: PartialRootBlock): AResult<RootBlock, MongoError> {
		const rootBlock: RootBlock = { ...block, id: uuid(), type: BlockType.Root };
		return intoResult<any, MongoError>(this.blocks.insertOne(rootBlock));
	}
}
