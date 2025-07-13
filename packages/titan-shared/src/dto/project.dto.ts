import {IsString, IsOptional, IsDateString, IsUUID, IsBoolean} from 'class-validator';

export class ProjectDto {
	@IsUUID()
	id: string;

	@IsString()
	name: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	color?: string;

	@IsBoolean()
	isActive: boolean;

	@IsOptional()
	@IsDateString()
	lastAccessedAt?: string;

	@IsDateString()
	createdAt: string;

	@IsDateString()
	updatedAt: string;
}

export class CreateProjectDto {
	@IsString()
	name: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	color?: string;
}

export class UpdateProjectDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	color?: string;
}
