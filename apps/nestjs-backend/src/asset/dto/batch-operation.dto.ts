import {
	IsEnum, IsArray, IsString, IsOptional,
} from 'class-validator';

export enum BatchOperationType {
	DELETE = 'delete',
	UPDATE_TAGS = 'update_tags',
	UPDATE_TYPE = 'update_type',
}

export class BatchOperationDto {
	@IsArray()
	@IsString({each: true})
	assetIds!: string[];

	@IsEnum(BatchOperationType)
	operation!: BatchOperationType;

	@IsArray()
	@IsString({each: true})
	@IsOptional()
	tags?: string[];

	@IsString()
	@IsOptional()
	assetType?: string;
}
