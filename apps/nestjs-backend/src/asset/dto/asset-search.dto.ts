import {IsEnum, IsString, IsOptional, IsArray, IsNumber, Min, Max} from 'class-validator';
import {Type} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import {AssetType} from '../../common/enums';

/**
 * 资源搜索DTO
 * 用于搜索和筛选资源的查询参数
 */
export class AssetSearchDto {
	@ApiProperty({
		description: '页码，从1开始',
		minimum: 1,
		example: 1,
		required: false,
		default: 1,
	})
	@IsNumber()
	@Min(1)
	@Type(() => Number)
	@IsOptional()
	page?: number = 1;

	@ApiProperty({
		description: '每页数量',
		minimum: 1,
		maximum: 100,
		example: 20,
		required: false,
		default: 20,
	})
	@IsNumber()
	@Min(1)
	@Max(100)
	@Type(() => Number)
	@IsOptional()
	pageSize?: number = 20;

	@ApiProperty({
		description: '资源类型过滤',
		enum: AssetType,
		example: AssetType.NARRATION_AUDIO,
		required: false,
	})
	@IsEnum(AssetType)
	@IsOptional()
	assetType?: AssetType;

	@ApiProperty({
		description: '标签过滤数组',
		type: [String],
		example: ['睡眠', 'ASMR'],
		required: false,
	})
	@IsArray()
	@IsString({each: true})
	@IsOptional()
	tags?: string[];

	@ApiProperty({
		description: '关键词搜索(搜索文件名和描述)',
		example: '雨声',
		required: false,
	})
	@IsString()
	@IsOptional()
	searchKeyword?: string;

	@ApiProperty({
		description: '排序字段',
		example: 'createdAt',
		default: 'createdAt',
		required: false,
	})
	@IsString()
	@IsOptional()
	sortBy?: string = 'createdAt';

	@ApiProperty({
		description: '排序方向',
		enum: ['ASC', 'DESC'],
		example: 'DESC',
		default: 'DESC',
		required: false,
	})
	@IsString()
	@IsOptional()
	sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
