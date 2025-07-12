import { IsArray, ValidateNested, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateContentJobDto } from './create-content-job.dto';

export class CreateBatchJobDto {
  @ApiProperty({ 
    description: '批量任务列表',
    type: [CreateContentJobDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContentJobDto)
  jobs: CreateContentJobDto[];

  @ApiProperty({ 
    description: '并发数量限制',
    minimum: 1,
    maximum: 10,
    default: 3,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  concurrency?: number = 3;
}