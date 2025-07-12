import {IsString, IsOptional, IsArray, IsEnum} from 'class-validator';
import {AssetType} from '../../common/enums';

export class UpdateAssetDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({each: true})
  @IsOptional()
  tags?: string[];

  @IsEnum(AssetType)
  @IsOptional()
  assetType?: AssetType;
}
