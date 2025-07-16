import {IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, ValidateNested, Min, Max} from 'class-validator';
import {Type} from 'class-transformer';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export enum VoiceType {
	GENTLE_FEMALE = 'gentle_female',
	WARM_MALE = 'warm_male',
	ELDERLY_FEMALE = 'elderly_female',
	ELDERLY_MALE = 'elderly_male',
	CHILD_FRIENDLY = 'child_friendly',
	NARRATOR = 'narrator',
}

export enum SoundscapeType {
	NATURE = 'nature',
	RAIN = 'rain',
	OCEAN = 'ocean',
	FOREST = 'forest',
	FIREPLACE = 'fireplace',
	WHITE_NOISE = 'white_noise',
	BROWN_NOISE = 'brown_noise',
	BINAURAL = 'binaural',
	NONE = 'none',
}

export enum GenerationStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	COMPLETED = 'completed',
	FAILED = 'failed',
	CANCELLED = 'cancelled',
}

export class VoiceSettings {
	@ApiProperty({enum: VoiceType, description: 'Voice type preset'})
	@IsEnum(VoiceType)
	type!: VoiceType;

	@ApiPropertyOptional({minimum: 0.5, maximum: 2, description: 'Voice speed multiplier'})
	@IsOptional()
	@IsNumber()
	@Min(0.5)
	@Max(2)
	speed?: number = 1;

	@ApiPropertyOptional({minimum: 0.1, maximum: 1, description: 'Voice volume'})
	@IsOptional()
	@IsNumber()
	@Min(0.1)
	@Max(1)
	volume?: number = 0.8;

	@ApiPropertyOptional({description: 'Custom voice stability (0-1)'})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(1)
	stability?: number = 0.5;

	@ApiPropertyOptional({description: 'Custom voice clarity (0-1)'})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(1)
	clarity?: number = 0.75;
}

export class SoundscapeSettings {
	@ApiProperty({enum: SoundscapeType, description: 'Soundscape type'})
	@IsEnum(SoundscapeType)
	type!: SoundscapeType;

	@ApiPropertyOptional({minimum: 0, maximum: 1, description: 'Soundscape volume'})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(1)
	volume?: number = 0.3;

	@ApiPropertyOptional({description: 'Custom soundscape parameters'})
	@IsOptional()
	customParameters?: Record<string, any>;
}

export class MixingSettings {
	@ApiPropertyOptional({description: 'Apply binaural effects'})
	@IsOptional()
	@IsBoolean()
	binaural?: boolean = false;

	@ApiPropertyOptional({description: 'Apply ASMR frequency filtering'})
	@IsOptional()
	@IsBoolean()
	asmrFilter?: boolean = true;

	@ApiPropertyOptional({description: 'Apply elderly-friendly optimization'})
	@IsOptional()
	@IsBoolean()
	elderlyOptimization?: boolean = true;

	@ApiPropertyOptional({minimum: 0, maximum: 1, description: 'Master volume'})
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(1)
	masterVolume?: number = 0.8;
}

export class GenerateASMRDto {
	@ApiProperty({description: 'Content title'})
	@IsString()
	title!: string;

	@ApiProperty({description: 'Text content to generate ASMR from'})
	@IsString()
	content!: string;

	@ApiPropertyOptional({description: 'Content description'})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({description: 'Voice settings', type: VoiceSettings})
	@ValidateNested()
	@Type(() => VoiceSettings)
	voice!: VoiceSettings;

	@ApiProperty({description: 'Soundscape settings', type: SoundscapeSettings})
	@ValidateNested()
	@Type(() => SoundscapeSettings)
	soundscape!: SoundscapeSettings;

	@ApiPropertyOptional({description: 'Mixing settings', type: MixingSettings})
	@IsOptional()
	@ValidateNested()
	@Type(() => MixingSettings)
	mixing?: MixingSettings;

	@ApiPropertyOptional({description: 'Tags for categorization'})
	@IsOptional()
	@IsArray()
	@IsString({each: true})
	tags?: string[];

	@ApiPropertyOptional({description: 'Is content private'})
	@IsOptional()
	@IsBoolean()
	isPrivate?: boolean = true;
}

export class ASMRGenerationRequest extends GenerateASMRDto {
	userId!: string;
}

export class CostEstimation {
	@ApiProperty({description: 'Total cost in credits'})
	totalCost!: number;

	@ApiProperty({description: 'Voice generation cost'})
	voiceCost!: number;

	@ApiProperty({description: 'Soundscape generation cost'})
	soundscapeCost!: number;

	@ApiProperty({description: 'Processing cost'})
	processingCost!: number;

	@ApiProperty({description: 'Estimated character count'})
	characterCount!: number;

	@ApiProperty({description: 'Estimated audio duration in seconds'})
	estimatedDuration!: number;

	@ApiProperty({description: 'Cost breakdown details'})
	breakdown!: Array<{
		item: string;
		cost: number;
		description: string;
	}>;
}

export class ASMRGenerationResponse {
	@ApiProperty({description: 'Generation ID'})
	generationId!: string;

	@ApiProperty({enum: GenerationStatus, description: 'Current status'})
	status!: GenerationStatus;

	@ApiProperty({description: 'Estimated duration in seconds'})
	estimatedDuration!: number;

	@ApiProperty({description: 'Generation cost information'})
	cost!: CostEstimation;

	@ApiProperty({description: 'Download URL when completed'})
	downloadUrl!: string;

	@ApiProperty({description: 'Progress stream URL'})
	progressUrl!: string;

	@ApiPropertyOptional({description: 'Error message if failed'})
	error?: string;
}

export class ASMRProgress {
	@ApiProperty({description: 'Generation ID'})
	generationId!: string;

	@ApiProperty({enum: GenerationStatus, description: 'Current status'})
	status!: GenerationStatus;

	@ApiProperty({minimum: 0, maximum: 100, description: 'Progress percentage'})
	progress!: number;

	@ApiProperty({description: 'Current step description'})
	currentStep!: string;

	@ApiPropertyOptional({description: 'Estimated time remaining in seconds'})
	estimatedTimeRemaining?: number;

	@ApiPropertyOptional({description: 'Error message if failed'})
	error?: string;

	@ApiProperty({description: 'Timestamp of this progress update'})
	timestamp!: Date;
}

export class ASMRPreset {
	@ApiProperty({description: 'Preset ID'})
	id!: string;

	@ApiProperty({description: 'Preset name'})
	name!: string;

	@ApiProperty({description: 'Preset description'})
	description!: string;

	@ApiProperty({description: 'Preset type'})
	type!: 'voice' | 'soundscape' | 'mixing';

	@ApiProperty({description: 'Preset configuration'})
	config!: VoiceSettings | SoundscapeSettings | MixingSettings;

	@ApiProperty({description: 'Is preset suitable for elderly users'})
	elderlyFriendly!: boolean;

	@ApiProperty({description: 'Preset tags'})
	tags!: string[];

	@ApiProperty({description: 'Usage count'})
	usageCount!: number;

	@ApiProperty({description: 'Average rating'})
	rating!: number;
}

export class ASMRLibraryItem {
	@ApiProperty({description: 'Item ID'})
	id!: string;

	@ApiProperty({description: 'Content title'})
	title!: string;

	@ApiProperty({description: 'Content description'})
	description!: string;

	@ApiProperty({description: 'File URL'})
	fileUrl!: string;

	@ApiProperty({description: 'Thumbnail URL'})
	thumbnailUrl?: string;

	@ApiProperty({description: 'Duration in seconds'})
	duration!: number;

	@ApiProperty({description: 'File size in bytes'})
	fileSize!: number;

	@ApiProperty({description: 'Content tags'})
	tags!: string[];

	@ApiProperty({description: 'Generation settings used'})
	generationSettings!: {
		voice: VoiceSettings;
		soundscape: SoundscapeSettings;
		mixing: MixingSettings;
	};

	@ApiProperty({description: 'Play count'})
	playCount!: number;

	@ApiProperty({description: 'User rating'})
	rating?: number;

	@ApiProperty({description: 'Creation date'})
	createdAt!: Date;

	@ApiProperty({description: 'Last modified date'})
	updatedAt!: Date;

	@ApiProperty({description: 'Is content private'})
	isPrivate!: boolean;

	@ApiProperty({description: 'Is item favorited by user'})
	isFavorite!: boolean;

	@ApiProperty({enum: GenerationStatus, description: 'Generation status'})
	status!: GenerationStatus;
}
