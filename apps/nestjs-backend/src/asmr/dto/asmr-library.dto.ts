import {IsOptional, IsString, IsNumber, IsBoolean, IsArray, IsEnum, Min, Max} from 'class-validator';
import {Type, Transform} from 'class-transformer';
import {ApiPropertyOptional, ApiProperty} from '@nestjs/swagger';
import {GenerationStatus} from './asmr-generation.dto';

export class LibraryFilterDto {
	@ApiPropertyOptional({description: 'Search term for title, description, or tags'})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({description: 'Filter by category'})
	@IsOptional()
	@IsString()
	category?: string;

	@ApiPropertyOptional({enum: GenerationStatus, description: 'Filter by generation status'})
	@IsOptional()
	@IsEnum(GenerationStatus)
	status?: GenerationStatus;

	@ApiPropertyOptional({description: 'Filter by tags (comma-separated)'})
	@IsOptional()
	@IsString()
	@Transform(({value}) => (value ? value.split(',').map((tag: string) => tag.trim()) : undefined))
	tags?: string[];

	@ApiPropertyOptional({description: 'Number of items per page', minimum: 1, maximum: 100})
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	@Max(100)
	limit?: number = 20;

	@ApiPropertyOptional({description: 'Offset for pagination', minimum: 0})
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	offset?: number = 0;

	@ApiPropertyOptional({description: 'Sort field'})
	@IsOptional()
	@IsString()
	sortBy?: string = 'createdAt';

	@ApiPropertyOptional({description: 'Sort order', enum: ['asc', 'desc']})
	@IsOptional()
	@IsEnum(['asc', 'desc'])
	sortOrder?: 'asc' | 'desc' = 'desc';

	@ApiPropertyOptional({description: 'Filter by favorites only'})
	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	favoritesOnly?: boolean = false;

	@ApiPropertyOptional({description: 'Filter by private/public status'})
	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	isPrivate?: boolean;

	@ApiPropertyOptional({description: 'Filter by minimum rating'})
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	@Max(5)
	minRating?: number;

	@ApiPropertyOptional({description: 'Filter by minimum duration (seconds)'})
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	minDuration?: number;

	@ApiPropertyOptional({description: 'Filter by maximum duration (seconds)'})
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	maxDuration?: number;

	@ApiPropertyOptional({description: 'Filter by date range start'})
	@IsOptional()
	@Type(() => Date)
	dateFrom?: Date;

	@ApiPropertyOptional({description: 'Filter by date range end'})
	@IsOptional()
	@Type(() => Date)
	dateTo?: Date;
}

export class UpdateLibraryItemDto {
	@ApiPropertyOptional({description: 'Update item title'})
	@IsOptional()
	@IsString()
	title?: string;

	@ApiPropertyOptional({description: 'Update item description'})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({description: 'Update item tags'})
	@IsOptional()
	@IsArray()
	@IsString({each: true})
	tags?: string[];

	@ApiPropertyOptional({description: 'Update privacy setting'})
	@IsOptional()
	@IsBoolean()
	isPrivate?: boolean;

	@ApiPropertyOptional({description: 'Update user rating'})
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(5)
	rating?: number;
}

export class LibraryStatsDto {
	@ApiProperty({description: 'Total number of items'})
	totalItems!: number;

	@ApiProperty({description: 'Number of completed items'})
	completedItems!: number;

	@ApiProperty({description: 'Number of processing items'})
	processingItems!: number;

	@ApiProperty({description: 'Number of failed items'})
	failedItems!: number;

	@ApiProperty({description: 'Number of favorite items'})
	favoriteItems!: number;

	@ApiProperty({description: 'Total duration in seconds'})
	totalDuration!: number;

	@ApiProperty({description: 'Total file size in bytes'})
	totalFileSize!: number;

	@ApiProperty({description: 'Total play count'})
	totalPlayCount!: number;

	@ApiProperty({description: 'Average rating'})
	averageRating!: number;

	@ApiProperty({description: 'Most used tags'})
	popularTags!: Array<{tag: string; count: number}>;

	@ApiProperty({description: 'Generation statistics by time period'})
	generationStats!: {
		today: number;
		thisWeek: number;
		thisMonth: number;
		thisYear: number;
	};

	@ApiProperty({description: 'Usage statistics'})
	usageStats!: {
		totalGenerations: number;
		totalCost: number;
		averageCostPerItem: number;
		averageDuration: number;
		mostUsedVoiceType: string;
		mostUsedSoundscapeType: string;
	};

	@ApiProperty({description: 'Recent activity'})
	recentActivity!: Array<{
		date: Date;
		action: string;
		count: number;
	}>;
}

export class BulkActionDto {
	@ApiProperty({description: 'Array of item IDs to perform action on'})
	@IsArray()
	@IsString({each: true})
	itemIds!: string[];

	@ApiProperty({
		description: 'Action to perform',
		enum: ['delete', 'favorite', 'unfavorite', 'update-tags', 'update-privacy'],
	})
	@IsEnum(['delete', 'favorite', 'unfavorite', 'update-tags', 'update-privacy'])
	action!: 'delete' | 'favorite' | 'unfavorite' | 'update-tags' | 'update-privacy';

	@ApiPropertyOptional({description: 'Additional data for the action'})
	@IsOptional()
	data?: {
		tags?: string[];
		isPrivate?: boolean;
	};
}

export class LibraryExportDto {
	@ApiProperty({description: 'Export format'})
	@IsEnum(['json', 'csv', 'xml'])
	format!: 'json' | 'csv' | 'xml';

	@ApiPropertyOptional({description: 'Include audio files in export'})
	@IsOptional()
	@IsBoolean()
	includeFiles?: boolean = false;

	@ApiPropertyOptional({description: 'Filter options for export'})
	@IsOptional()
	filters?: Omit<LibraryFilterDto, 'limit' | 'offset'>;
}

export class LibraryItemFavorite {
	@ApiProperty({description: 'Item ID'})
	itemId!: string;

	@ApiProperty({description: 'User ID'})
	userId!: string;

	@ApiProperty({description: 'Is favorite'})
	isFavorite!: boolean;

	@ApiProperty({description: 'Date when favorited'})
	createdAt!: Date;
}

export class LibraryItemRating {
	@ApiProperty({description: 'Item ID'})
	itemId!: string;

	@ApiProperty({description: 'User ID'})
	userId!: string;

	@ApiProperty({description: 'Rating value (1-5)'})
	rating!: number;

	@ApiProperty({description: 'Date when rated'})
	createdAt!: Date;

	@ApiProperty({description: 'Last updated date'})
	updatedAt!: Date;
}

export class LibraryUsageAnalytics {
	@ApiProperty({description: 'Most played items'})
	mostPlayedItems!: Array<{
		id: string;
		title: string;
		playCount: number;
		duration: number;
	}>;

	@ApiProperty({description: 'Most favorite items'})
	mostFavoriteItems!: Array<{
		id: string;
		title: string;
		favoriteCount: number;
		rating: number;
	}>;

	@ApiProperty({description: 'Usage patterns by time'})
	usagePatterns!: {
		hourly: Array<{hour: number; count: number}>;
		daily: Array<{day: string; count: number}>;
		monthly: Array<{month: string; count: number}>;
	};

	@ApiProperty({description: 'Content preferences'})
	contentPreferences!: {
		preferredVoiceTypes: Array<{type: string; count: number; percentage: number}>;
		preferredSoundscapeTypes: Array<{type: string; count: number; percentage: number}>;
		preferredDurations: Array<{range: string; count: number; percentage: number}>;
	};

	@ApiProperty({description: 'Generation success rate'})
	generationStats!: {
		successRate: number;
		averageGenerationTime: number;
		failureReasons: Array<{reason: string; count: number}>;
	};
}
