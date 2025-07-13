import {
	IsEnum, IsString, IsOptional, IsArray, IsNumber, Min,
} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {AssetType} from '../../common/enums';

/**
 * 上传资源文件DTO
 * 定义上传资源时需要的参数和元数据
 */
export class UploadAssetDto {
	@ApiProperty({
		description: '资源文件类型',
		enum: AssetType,
		example: AssetType.BACKGROUND_IMAGE,
		required: true,
	})
	@IsEnum(AssetType)
	assetType!: AssetType;

	@ApiProperty({
		description: '资源标签数组，用于分类和搜索',
		type: [String],
		example: ['睡眠', 'ASMR', '放松'],
		required: false,
	})
	@IsArray()
	@IsString({each: true})
	@IsOptional()
	tags?: string[];

	@ApiProperty({
		description: '资源描述信息',
		example: '轻柔的雨声背景音乐，适合睡眠放松',
		required: false,
	})
	@IsString()
	@IsOptional()
	description?: string;
}
