import {IsString, IsOptional, IsNumber, IsBoolean, Length, Min, Max} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class GenerateImageDto {
	@ApiProperty({
		description: '图片生成提示词',
		example: 'peaceful forest stream with soft sunlight filtering through trees',
		minLength: 1,
		maxLength: 500,
	})
	@IsString()
	@Length(1, 500)
	prompt: string;

	@ApiPropertyOptional({
		description: '随机种子，用于生成一致的图片',
		example: 1234,
		minimum: 1,
		maximum: 10000,
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(10000)
	seed?: number;

	@ApiPropertyOptional({
		description: '图片宽度',
		example: 1024,
		minimum: 256,
		maximum: 2048,
	})
	@IsOptional()
	@IsNumber()
	@Min(256)
	@Max(2048)
	width?: number;

	@ApiPropertyOptional({
		description: '图片高度',
		example: 1024,
		minimum: 256,
		maximum: 2048,
	})
	@IsOptional()
	@IsNumber()
	@Min(256)
	@Max(2048)
	height?: number;

	@ApiPropertyOptional({
		description: '是否保存到Asset系统',
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	saveToAsset?: boolean;

	@ApiPropertyOptional({
		description: '项目ID（可选，用于将生成的图片关联到项目）',
		example: 'uuid-project-id',
	})
	@IsOptional()
	@IsString()
	projectId?: string;
}

export class BatchGenerateImageDto {
	@ApiProperty({
		description: '图片生成提示词数组',
		example: [
			'peaceful forest stream with soft sunlight',
			'tranquil mountain lake at sunset',
			'cozy fireplace with warm candlelight',
		],
		isArray: true,
		type: String,
	})
	@IsString({each: true})
	@Length(1, 500, {each: true})
	prompts: string[];

	@ApiPropertyOptional({
		description: '图片宽度',
		example: 1024,
		minimum: 256,
		maximum: 2048,
	})
	@IsOptional()
	@IsNumber()
	@Min(256)
	@Max(2048)
	width?: number;

	@ApiPropertyOptional({
		description: '图片高度',
		example: 1024,
		minimum: 256,
		maximum: 2048,
	})
	@IsOptional()
	@IsNumber()
	@Min(256)
	@Max(2048)
	height?: number;

	@ApiPropertyOptional({
		description: '是否保存到Asset系统',
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	saveToAsset?: boolean;

	@ApiPropertyOptional({
		description: '项目ID（可选，用于将生成的图片关联到项目）',
		example: 'uuid-project-id',
	})
	@IsOptional()
	@IsString()
	projectId?: string;
}

export class RegenerateImageDto {
	@ApiProperty({
		description: '原始提示词',
		example: 'peaceful forest stream with soft sunlight filtering through trees',
	})
	@IsString()
	@Length(1, 500)
	originalPrompt: string;

	@ApiPropertyOptional({
		description: '图片宽度',
		example: 1024,
		minimum: 256,
		maximum: 2048,
	})
	@IsOptional()
	@IsNumber()
	@Min(256)
	@Max(2048)
	width?: number;

	@ApiPropertyOptional({
		description: '图片高度',
		example: 1024,
		minimum: 256,
		maximum: 2048,
	})
	@IsOptional()
	@IsNumber()
	@Min(256)
	@Max(2048)
	height?: number;

	@ApiPropertyOptional({
		description: '是否保存到Asset系统',
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	saveToAsset?: boolean;
}