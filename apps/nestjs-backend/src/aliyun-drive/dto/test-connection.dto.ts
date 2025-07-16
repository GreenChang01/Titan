import {IsString, IsOptional, IsUrl, IsInt, Min, Max} from 'class-validator';

export class TestConnectionDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsUrl()
	webdavUrl!: string;

	@IsString()
	username!: string;

	@IsString()
	password!: string;

	@IsOptional()
	@IsInt()
	@Min(1000)
	@Max(300_000)
	timeout?: number;

	@IsOptional()
	@IsString()
	basePath?: string;
}

export class TestConnectionResponseDto {
	success!: boolean;
	message!: string;
	responseTime?: number;
	error?: string;
}
