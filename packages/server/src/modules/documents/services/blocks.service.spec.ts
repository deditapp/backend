import { config } from "dotenv";
import { MongoClient } from "mongodb";

import { BlockType } from "@dedit/models/dist/v1";
import { ConfigService } from "@nestjs/config";

import { BlocksService } from "./blocks.service";

describe("BlocksService", () => {
	let mongo: MongoClient;
	let blockService: BlocksService;

	// create utility mongo connection
	beforeAll(async () => {
		config();
		mongo = new MongoClient(process.env.TEST_MONGODB_URL ?? "");
		// connect to mongo and ping the database
		await mongo.connect();
		await mongo.db("dedit").admin().ping();
	});

	// close mongo connection after each test
	afterAll(async () => {
		await mongo.close();
	});

	// create a new BlocksService for every method.
	beforeEach(async () => {
		const config = new ConfigService();
		blockService = new BlocksService(config);
		await blockService.onModuleInit();
	});

	// destroy the BlocksService after every method.
	afterEach(async () => {
		await blockService.onModuleDestroy();
		await mongo.db("dedit").collection("blocks").deleteMany({});
	});

	describe("create", () => {
		it("should create a new block", async () => {
			const result = await blockService.createEmpty();
			// unwrap block
			const block = result.unwrap();
			expect(block).toBeDefined();
			expect(block).toMatch(
				/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
			);
		});
	});

	describe("block", () => {
		beforeAll(async () => {
			mongo
				.db("dedit")
				.collection("blocks")
				.insertMany([
					{
						id: "00000000-0000-0000-0000-000000000000",
						type: BlockType.Root,
						children: [],
						tags: [],
					},
				]);
		});

		it("should fetch a root block with the given ID", async () => {
			const result = await blockService.getBlock("00000000-0000-0000-0000-000000000000");
			// unwrap block
			const block = result.unwrap();
			expect(block).toBeDefined();

			expect(block?.id).toBe("00000000-0000-0000-0000-000000000000");
			expect(block?.type).toBe(BlockType.Root);
		});
	});
});
