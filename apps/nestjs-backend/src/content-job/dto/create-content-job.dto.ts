import { IsUUID, IsEnum, IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '../../common/enums';

export class AssetMapping {
  @ApiProperty({ description: '素材ID' })
  @IsUUID()
  assetId: string;

  @ApiProperty({ description: '插槽名称' })
  @IsString()
  slotName: string;

  @ApiProperty({ description: '参数配置', required: false })
  @IsOptional()
  parameters?: Record<string, any>;
}

export class CreateContentJobDto {
  @ApiProperty({ description: '项目ID' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ description: '模板ID' })
  @IsUUID()
  templateId: string;

  @ApiProperty({ 
    description: '任务类型',
    enum: JobType,
    default: JobType.SINGLE
  })
  @IsEnum(JobType)
  jobType: JobType = JobType.SINGLE;

  @ApiProperty({ 
    description: '输入素材映射',
    type: [AssetMapping]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetMapping)
  inputAssets: AssetMapping[];
}