import {IsString, IsOptional, IsNumber, IsUUID, IsDateString, IsBoolean} from 'class-validator';

export class ProjectMaterialDto {
  @IsUUID()
  id: string;

  @IsString()
  aliyunFileId: string;

  @IsString()
  fileName: string;

  @IsString()
  filePath: string;

  @IsString()
  fileType: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsDateString()
  fileCreatedAt?: string;

  @IsOptional()
  @IsDateString()
  fileUpdatedAt?: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;
}

export class AddMaterialDto {
  @IsString()
  aliyunFileId: string;

  @IsString()
  fileName: string;

  @IsString()
  filePath: string;

  @IsString()
  fileType: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsDateString()
  fileCreatedAt?: string;

  @IsOptional()
  @IsDateString()
  fileUpdatedAt?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
