import {IsEnum, IsUUID, IsOptional, IsDateString, IsObject} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {PublicationPlatform} from '../entities/publication.entity';

export class CreatePublicationDto {
  @ApiProperty({description: '内容任务ID'})
  @IsUUID()
  contentJobId!: string;

  @ApiProperty({
    description: '发布平台',
    enum: PublicationPlatform,
  })
  @IsEnum(PublicationPlatform)
  platform!: PublicationPlatform;

  @ApiProperty({
    description: '预定发布时间（可选）',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({
    description: '发布配置（标题、描述等）',
    required: false,
  })
  @IsOptional()
  @IsObject()
  publishConfig?: Record<string, any>;
}
