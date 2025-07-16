import {IsString, IsOptional, IsUrl, IsInt, Min, Max} from 'class-validator';

export class UpdateAliyunDriveConfigDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsUrl()
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
	@IsInt()
	@Min(1000)
	@Max(300_000)
	timeout?: number;

	@IsOptional()
	@IsString()
	basePath?: string;
}
