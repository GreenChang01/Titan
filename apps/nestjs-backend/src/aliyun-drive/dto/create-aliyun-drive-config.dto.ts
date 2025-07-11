import {IsString, IsOptional, IsUrl, IsInt, Min, Max} from 'class-validator';

export class CreateAliyunDriveConfigDto {
  @IsUrl()
  webdavUrl!: string;

  @IsString()
  username!: string;

  @IsString()
  password!: string;

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
