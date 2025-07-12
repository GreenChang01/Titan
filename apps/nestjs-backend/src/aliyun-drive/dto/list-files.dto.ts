import {IsOptional, IsString, IsInt, Min, Max} from 'class-validator';

export class ListFilesDto {
  @IsOptional()
  @IsString()
  path?: string = '/';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  search?: string;
}

export type WebDavFileDto = {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  contentType?: string;
  lastModified?: Date;
};

export type ListFilesResponseDto = {
  files: WebDavFileDto[];
  total: number;
  path: string;
  limit: number;
  offset: number;
  hasMore: boolean;
};
