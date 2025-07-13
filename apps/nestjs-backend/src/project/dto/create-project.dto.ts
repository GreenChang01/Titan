import {
	IsString, IsOptional, Length, IsHexColor,
} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

/**
 * 创建项目DTO
 * 用于创建新的内容项目
 */
export class CreateProjectDto {
	@ApiProperty({
		description: '项目名称',
		minLength: 1,
		maxLength: 100,
		example: '睡眠引导内容系列',
	})
	@IsString()
	@Length(1, 100)
	name!: string;

	@ApiProperty({
		description: '项目描述信息',
		maxLength: 500,
		example: '专注于睡眠引导的ASMR内容项目，包含多种放松场景和音景组合',
		required: false,
	})
	@IsOptional()
	@IsString()
	@Length(0, 500)
	description?: string;

	@ApiProperty({
		description: '项目颜色标识(十六进制色值)',
		example: '#4F46E5',
		required: false,
	})
	@IsOptional()
	@IsString()
	@IsHexColor()
	color?: string;
}
