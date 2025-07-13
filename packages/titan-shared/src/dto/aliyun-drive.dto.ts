import {IsString, IsOptional, IsNumber, IsUUID, IsDateString, IsBoolean} from 'class-validator';

export class AliyunDriveConfigDto {
	@IsUUID()
	id: string;

	@IsString()
	webdavUrl: string;

	@IsString()
	username: string;

	@IsOptional()
	@IsString()
	displayName?: string;

	@IsNumber()
	timeout: number;

	@IsString()
	basePath: string;

	@IsOptional()
	@IsDateString()
	lastSyncAt?: string;

	@IsBoolean()
	isActive: boolean;

	@IsDateString()
	createdAt: string;

	@IsDateString()
	updatedAt: string;
}

export class CreateAliyunDriveConfigDto {
	@IsString()
	webdavUrl: string;

	@IsString()
	username: string;

	@IsString()
	password: string;

	@IsOptional()
	@IsString()
	displayName?: string;

	@IsOptional()
	@IsNumber()
	timeout?: number;

	@IsOptional()
	@IsString()
	basePath?: string;
}

export class UpdateAliyunDriveConfigDto {
	@IsOptional()
	@IsString()
	webdavUrl?: string;

	@IsOptional()
	@IsString()
	username?: string;

	@IsOptional()
	@IsString()
	password?: string;

	@IsOptional()
	@IsString()
	displayName?: string;

	@IsOptional()
	@IsNumber()
	timeout?: number;

	@IsOptional()
	@IsString()
	basePath?: string;
}

export class WebDavFileDto {
	@IsString()
	name: string;

	@IsString()
	path: string;

	@IsBoolean()
	isDirectory: boolean;

	@IsOptional()
	@IsNumber()
	size?: number;

	@IsOptional()
	@IsString()
	contentType?: string;

	@IsOptional()
	@IsDateString()
	lastModified?: string;
}

export class ListFilesDto {
	@IsOptional()
	@IsString()
	path?: string;
}

export class ListFilesResponseDto {
	@IsString()
	path: string;

	@IsNumber()
	total: number;

	files: WebDavFileDto[];
}
