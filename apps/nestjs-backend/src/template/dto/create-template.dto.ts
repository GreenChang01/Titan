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
  Max 
} from 'class-validator';
import { Type } from 'class-transformer';
import { SlotDefinition, TemplateConfig, VideoSettings } from '../types/content-template.types';

class SlotDefinitionDto implements SlotDefinition {
  @IsString()
  name!: string;

  @IsString()
  @IsIn(['text', 'image', 'audio', 'voice', 'soundscape', 'background_music'])
  type!: 'text' | 'image' | 'audio' | 'voice' | 'soundscape' | 'background_music';

  @IsBoolean()
  required!: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

class VideoSettingsDto implements VideoSettings {
  @IsString()
  resolution!: string;

  @IsNumber()
  @Min(1)
  @Max(120)
  fps!: number;

  @IsString()
  duration!: string;

  @IsNumber()
  @IsOptional()
  @Min(8000)
  @Max(192000)
  sampleRate?: number;

  @IsNumber()
  @IsOptional()
  @IsIn([1, 2])
  audioChannels?: 1 | 2;

  @IsString()
  @IsOptional()
  bitrate?: string;
}

export class CreateTemplateDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  templateConfig?: TemplateConfig;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDefinitionDto)
  @IsOptional()
  slotDefinitions?: SlotDefinitionDto[];

  @ValidateNested()
  @Type(() => VideoSettingsDto)
  @IsOptional()
  videoSettings?: VideoSettingsDto;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = false;
}