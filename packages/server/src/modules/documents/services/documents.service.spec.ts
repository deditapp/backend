import { randomUUID } from "crypto";
import { config } from "dotenv";
import { PrismaService } from "src/services/prisma.service";

import { Test, TestingModule } from "@nestjs/testing";

import { DocumentsService } from "./documents.service";

const mockUserId = randomUUID();

describe("DocumentsService", () => {
	let moduleRef: TestingModule;
	let documentsService: DocumentsService;

	beforeEach(async () => {
		config();
		// instantiate testing module
		moduleRef = await Test.createTestingModule({
			providers: [DocumentsService, PrismaService],
		}).compile();
		// enable shutdown hooks
		moduleRef.enableShutdownHooks();
		// initialize and get provider instance
		await moduleRef.init();
		documentsService = moduleRef.get(DocumentsService);

		// create a mock user
		const prismaService = moduleRef.get(PrismaService);
		await prismaService.user.create({
			data: {
				id: mockUserId,
				firebaseUid: "",
			},
		});
	});

	afterEach(async () => {
		moduleRef.close();
		// delete the mock user
		const prismaService = moduleRef.get(PrismaService);
		await prismaService.user.delete({
			where: { id: mockUserId },
		});
	});

	it("should create and delete a document", async () => {
		// create
		const createResult = await documentsService.createDocument(mockUserId);
		expect(createResult.isOk()).toBe(true);
		const document = createResult.unwrap();
		expect(document).toBeDefined();
		// delete
		const deleteResult = await documentsService.deleteDocument(document.id);
		expect(deleteResult.isOk()).toBe(true);
		// get
		const getResult = await documentsService.getDocument(document.id);
		expect(getResult.isOk()).toBe(true);
		expect(getResult.unwrap()).toBeUndefined();
	});
});
