import { IsEnum, IsString, IsOptional, IsArray, IsNumber, Min } from 'class-validator';
import { AssetType } from '../../common/enums';

export class UploadAssetDto {
  @IsEnum(AssetType)
  assetType: AssetType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}