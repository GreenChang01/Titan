import { IsEnum, IsString, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetType } from '../../common/enums';

export class AssetSearchDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 20;

  @IsEnum(AssetType)
  @IsOptional()
  assetType?: AssetType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  searchKeyword?: string;

  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}