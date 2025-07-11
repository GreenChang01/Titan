import {IsString, IsOptional, IsArray, IsBoolean} from 'class-validator';

export class UploadFileDto {
  @IsString()
  fileName!: string;

  @IsString()
  path!: string;

  @IsOptional()
  @IsBoolean()
  overwrite?: boolean = false;
}

export class DownloadFileDto {
  @IsString()
  filePath!: string;

  @IsOptional()
  @IsString()
  downloadName?: string;
}

export class CreateDirectoryDto {
  @IsString()
  path!: string;

  @IsString()
  directoryName!: string;
}

export class DeleteItemsDto {
  @IsArray()
  @IsString({each: true})
  paths!: string[];
}

export class MoveItemDto {
  @IsString()
  sourcePath!: string;

  @IsString()
  targetPath!: string;

  @IsOptional()
  @IsBoolean()
  overwrite?: boolean = false;
}

export class CopyItemDto {
  @IsString()
  sourcePath!: string;

  @IsString()
  targetPath!: string;

  @IsOptional()
  @IsBoolean()
  overwrite?: boolean = false;
}

export type FileOperationResponseDto = {
  success: boolean;
  message?: string;
  path?: string;
  error?: string;
};
