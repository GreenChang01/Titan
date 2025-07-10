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

export interface WebDAVFileDto {
  filename: string;
  basename: string;
  lastmod: string;
  size: number;
  type: 'file' | 'directory';
  etag?: string;
  mime?: string;
  props?: Record<string, any>;
}

export interface ListFilesResponseDto {
  files: WebDAVFileDto[];
  total: number;
  path: string;
  hasMore: boolean;
}
