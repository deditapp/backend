import { AuthenticatedGuard } from "src/guards/AuthenticatedGuard";

import { AnyBlock, BlockType, RootBlock } from "@dedit/models/dist/v1";
import {
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	Param,
	Post,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBody,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiProperty,
	ApiPropertyOptional,
	ApiTags,
} from "@nestjs/swagger";
import { DocumentRevision } from "@prisma/client";

import { BlocksService, PartialRootBlock } from "../../services/blocks.service";
import { RevisionsService } from "../../services/revisions.service";

/**
 * Data transfer object for `RootBlock` tpe.
 */
export class RootBlockDto {
	@ApiProperty()
	id!: string;
	@ApiProperty({ type: Number })
	type!: BlockType.Root;
	@ApiProperty({ type: [() => AnyBlockDto] })
	children!: AnyBlockDto[];
	@ApiProperty({ type: [String] })
	tags!: string[];
}

/**
 * Data transfer object for root block creation payload.
 */
export class CreateRootBlockDto {
	@ApiProperty({ type: Number })
	type!: BlockType;
	@ApiProperty({ type: [() => AnyBlockDto] })
	children!: AnyBlockDto[];
	@ApiProperty({ type: [String] })
	tags!: string[];
}

/**
 * Data transfer object for `AnyBlock` type.
 */
export class AnyBlockDto {
	@ApiProperty({ type: Number })
	type!: BlockType;
	@ApiPropertyOptional({ type: () => [AnyBlockDto] })
	children?: AnyBlock[];
	@ApiPropertyOptional({ type: Object })
	data!: any;
}

/**
 * Data transfer object for `DocumentRevision` type.
 */
export class DocumentRevisionDto implements Omit<DocumentRevision, "blockId" | "createdAt"> {
	@ApiProperty()
	id!: string;
	@ApiProperty()
	documentId!: string;
	@ApiProperty({ type: String })
	createdAt!: string;
	@ApiProperty({ type: [() => RootBlockDto] })
	content!: RootBlock;
}

@Controller({ path: "/documents/:documentId", version: "1" })
@UseGuards(AuthenticatedGuard)
@ApiTags("revisions")
export class RevisionsControllerV1 {
	constructor(
		private readonly revisions: RevisionsService,
		private readonly blocks: BlocksService
	) {}

	@Get("/revisions")
	@ApiParam({ name: "documentId", type: String, description: "The document ID" })
	@ApiOperation({ operationId: "getDocumentRevisions" })
	@ApiOkResponse({ type: [DocumentRevisionDto] })
	async getDocumentRevisions(@Param("documentId") documentId: string): Promise<DocumentRevision[]> {
		const result = await this.revisions.getRevisions(documentId);
		if (result.isErr()) {
			throw new InternalServerErrorException(result.unwrapErr());
		}
		return result.unwrap();
	}

	@Get("/revisions/latest")
	@ApiParam({ name: "documentId", type: String, description: "The document ID" })
	@ApiOperation({ operationId: "getLatestDocumentRevision" })
	@ApiOkResponse({ type: [DocumentRevisionDto] })
	async getLatestDocumentRevision(
		@Param("documentId") documentId: string
	): Promise<DocumentRevision> {
		const result = await this.revisions.getLatestRevision(documentId);
		if (result.isErr()) {
			throw new InternalServerErrorException(result.unwrapErr());
		}
		return result.unwrap();
	}

	@Post("/revisions")
	@ApiParam({ name: "documentId", type: String, description: "The document ID" })
	@ApiBody({ type: CreateRootBlockDto, description: "The editor AST" })
	@ApiOperation({ operationId: "createDocumentRevision" })
	@ApiOkResponse({ type: DocumentRevisionDto })
	async createDocumentRevision(
		documentId: string,
		@Body()
		payload: CreateRootBlockDto
	): Promise<DocumentRevision> {
		const block = await this.blocks.insertBlock(payload as PartialRootBlock);
		if (block.isErr()) {
			throw new InternalServerErrorException(block.unwrapErr());
		}
		const revision = await this.revisions.createRevision(documentId, block.unwrap().id);
		if (revision.isErr()) {
			throw new InternalServerErrorException(revision.unwrapErr());
		}
		return revision.unwrap();
	}
}
