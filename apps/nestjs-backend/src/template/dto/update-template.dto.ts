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
import {SlotDefinition, TemplateConfig, VideoSettings} from '../types/content-template.types';

class SlotDefinitionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsIn(['text', 'image', 'audio', 'voice', 'soundscape', 'background_music'])
  @IsOptional()
  type?: 'text' | 'image' | 'audio' | 'voice' | 'soundscape' | 'background_music';

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

class VideoSettingsDto implements Partial<VideoSettings> {
  @IsString()
  @IsOptional()
  resolution?: string;

  @IsNumber()
  @Min(1)
  @Max(120)
  @IsOptional()
  fps?: number;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsNumber()
  @IsOptional()
  @Min(8000)
  @Max(192_000)
  sampleRate?: number;

  @IsNumber()
  @IsOptional()
  @IsIn([1, 2])
  audioChannels?: 1 | 2;

  @IsString()
  @IsOptional()
  bitrate?: string;
}

export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  templateConfig?: TemplateConfig;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => SlotDefinitionDto)
  @IsOptional()
  slotDefinitions?: SlotDefinitionDto[];

  @ValidateNested()
  @Type(() => VideoSettingsDto)
  @IsOptional()
  videoSettings?: VideoSettingsDto;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
