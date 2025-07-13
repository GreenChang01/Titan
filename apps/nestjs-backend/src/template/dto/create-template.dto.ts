import {
	IsString,
	IsOptional,
	IsBoolean,
	IsArray,
	ValidateNested,
	IsObject,
	IsIn,
	IsNumber,
	Min,
	Max,
} from 'class-validator';
import {Type} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import {SlotDefinition, TemplateConfig, VideoSettings} from '../types/content-template.types';

/**
 * 模板变量槽位定义DTO
 * 定义内容模板中的可变部分
 */
class SlotDefinitionDto implements SlotDefinition {
	@ApiProperty({
		description: '槽位名称，用于标识变量位置',
		example: 'background_voice',
	})
	@IsString()
	name!: string;

	@ApiProperty({
		description: '槽位数据类型',
		enum: ['text', 'image', 'audio', 'voice', 'soundscape', 'background_music'],
		example: 'voice',
	})
	@IsString()
	@IsIn(['text', 'image', 'audio', 'voice', 'soundscape', 'background_music'])
	type!: 'text' | 'image' | 'audio' | 'voice' | 'soundscape' | 'background_music';

	@ApiProperty({
		description: '是否为必填槽位',
		example: true,
	})
	@IsBoolean()
	required!: boolean;

	@ApiProperty({
		description: '槽位描述说明',
		example: '主要的语音内容，用于ASMR引导',
		required: false,
	})
	@IsString()
	@IsOptional()
	description?: string;
}

/**
 * 视频输出设置DTO
 * 定义生成视频的参数配置
 */
class VideoSettingsDto implements VideoSettings {
	@ApiProperty({
		description: '视频分辨率',
		example: '1080x1920',
		default: '1080x1920',
	})
	@IsString()
	resolution!: string;

	@ApiProperty({
		description: '视频帧率(FPS)',
		minimum: 1,
		maximum: 120,
		example: 30,
	})
	@IsNumber()
	@Min(1)
	@Max(120)
	fps!: number;

	@ApiProperty({
		description: '视频时长格式(HH:mm:ss)',
		example: '00:05:00',
	})
	@IsString()
	duration!: string;

	@ApiProperty({
		description: '音频采样率(Hz)',
		minimum: 8000,
		maximum: 192_000,
		example: 48_000,
		required: false,
	})
	@IsNumber()
	@IsOptional()
	@Min(8000)
	@Max(192_000)
	sampleRate?: number;

	@ApiProperty({
		description: '音频声道数',
		enum: [1, 2],
		example: 2,
		required: false,
	})
	@IsNumber()
	@IsOptional()
	@IsIn([1, 2])
	audioChannels?: 1 | 2;

	@ApiProperty({
		description: '视频比特率',
		example: '2000k',
		required: false,
	})
	@IsString()
	@IsOptional()
	bitrate?: string;
}

/**
 * 创建内容模板DTO
 * 用于创建新的ASMR内容生产模板
 */
export class CreateTemplateDto {
	@ApiProperty({
		description: '模板名称',
		example: '睡眠引导ASMR模板',
	})
	@IsString()
	name!: string;

	@ApiProperty({
		description: '模板描述',
		example: '专为睡眠放松设计的ASMR内容模板，包含温柔的语音引导和自然背景音',
		required: false,
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({
		description: '模板配置参数',
		example: {
			voice: {stability: 0.8, similarity: 0.9},
			audio: {fadeIn: 3, fadeOut: 5},
		},
		required: false,
	})
	@IsObject()
	@IsOptional()
	templateConfig?: TemplateConfig;

	@ApiProperty({
		description: '模板变量槽位定义数组',
		type: [SlotDefinitionDto],
		required: false,
	})
	@IsArray()
	@ValidateNested({each: true})
	@Type(() => SlotDefinitionDto)
	@IsOptional()
	slotDefinitions?: SlotDefinitionDto[];

	@ApiProperty({
		description: '视频输出设置',
		type: VideoSettingsDto,
		required: false,
	})
	@ValidateNested()
	@Type(() => VideoSettingsDto)
	@IsOptional()
	videoSettings?: VideoSettingsDto;

	@ApiProperty({
		description: '是否为公共模板',
		example: false,
		default: false,
		required: false,
	})
	@IsBoolean()
	@IsOptional()
	isPublic?: boolean = false;
}
