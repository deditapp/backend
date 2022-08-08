import { Block, BlockType, Document, RootBlock } from "@dedit/models/dist/v1";
import { AnyBlock } from "@dedit/models/src/v1";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { DeepPartial } from "../../types/utils";

export class DocumentDto implements Document {
	@ApiProperty()
	id!: string;
	@ApiProperty()
	title!: string;
	@ApiProperty()
	tags!: string[];
	@ApiProperty()
	createdAt!: string;
	@ApiProperty()
	updatedAt!: string;
	@ApiProperty()
	ownerId!: string;
}

export class UpdateDocumentPayloadDto implements Partial<Document> {
	@ApiPropertyOptional()
	title!: string;
	@ApiPropertyOptional()
	tags!: string[];
	@ApiPropertyOptional()
	createdAt!: string;
	@ApiPropertyOptional()
	updatedAt!: string;
	@ApiPropertyOptional()
	ownerId!: string;
}

export class UpdateDocumentDto {
	@ApiPropertyOptional()
	document!: UpdateDocumentPayloadDto;
}

export class UpdateRootBlockDto implements DeepPartial<RootBlock> {
	@ApiPropertyOptional()
	children?: AnyBlock[];
	@ApiPropertyOptional()
	tags?: string[];
}

/**
 * DTO type for update block payload.
 */
export class UpdateBlockDto implements DeepPartial<Block> {
	@ApiPropertyOptional({ enum: BlockType })
	type?: BlockType;
	@ApiPropertyOptional({ type: [() => UpdateBlockDto, () => CreateBlockDto] })
	children?: AnyBlock[];
}

/**
 * DTO type for create block payload.
 */
export class CreateBlockDto implements Block {
	@ApiProperty({ enum: BlockType })
	type!: BlockType;
	@ApiProperty({ type: [() => UpdateBlockDto, () => CreateBlockDto] })
	children!: AnyBlock[];
}
