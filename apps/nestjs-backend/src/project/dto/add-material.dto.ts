import {
	IsString, IsOptional, Length, IsDateString, IsNumber, Min,
} from 'class-validator';

export class AddMaterialDto {
	@IsString()
	@Length(1, 200)
	aliyunFileId!: string;

	@IsString()
	@Length(1, 255)
	fileName!: string;

	@IsString()
	@Length(1, 500)
	filePath!: string;

	@IsString()
	@Length(1, 50)
	fileType!: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	fileSize?: number;

	@IsOptional()
	@IsString()
	@Length(0, 500)
	thumbnailUrl?: string;

	@IsOptional()
	@IsDateString()
	fileCreatedAt?: string;

	@IsOptional()
	@IsDateString()
	fileUpdatedAt?: string;

	@IsOptional()
	@IsString()
	@Length(0, 500)
	description?: string;

	@IsOptional()
	metadata?: Record<string, unknown>;
}
