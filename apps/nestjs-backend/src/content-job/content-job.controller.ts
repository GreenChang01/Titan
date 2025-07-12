import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { ActiveUser } from '../auth/types/active-user.type';
import { ContentJobService } from './content-job.service';
import { CreateContentJobDto, CreateBatchJobDto } from './dto';
import { JobStatus } from '../common/enums';

@ApiTags('Content Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class ContentJobController {
  constructor(private readonly contentJobService: ContentJobService) {}

  @Post('create-single')
  @ApiOperation({ summary: 'Create a single content production job' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Job created successfully' })
  async createSingleJob(
    @Body() createJobDto: CreateContentJobDto,
    @User() user: ActiveUser,
  ) {
    const job = await this.contentJobService.createSingleJob(createJobDto, user.userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Content job created successfully',
      data: job,
    };
  }

  @Post('create-batch')
  @ApiOperation({ summary: 'Create batch content production jobs' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Batch jobs created successfully' })
  async createBatchJobs(
    @Body() createBatchDto: CreateBatchJobDto,
    @User() user: ActiveUser,
  ) {
    const jobs = await this.contentJobService.createBatchJobs(createBatchDto, user.userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Batch jobs created successfully',
      data: jobs,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get user content jobs list' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Jobs retrieved successfully' })
  @ApiQuery({ name: 'status', enum: JobStatus, required: false })
  @ApiQuery({ name: 'projectId', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  async getJobs(
    @User() user: ActiveUser,
    @Query('status') status?: JobStatus,
    @Query('projectId') projectId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const jobs = await this.contentJobService.getJobs(user.userId, {
      status,
      projectId,
      page,
      limit,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Jobs retrieved successfully',
      data: jobs,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content job details' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Job details retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  async getJobById(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: ActiveUser,
  ) {
    const job = await this.contentJobService.getJobById(id, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Job details retrieved successfully',
      data: job,
    };
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get job processing progress' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Job progress retrieved successfully' })
  async getJobProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: ActiveUser,
  ) {
    const progress = await this.contentJobService.getJobProgress(id, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Job progress retrieved successfully',
      data: progress,
    };
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry failed job' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Job retry initiated successfully' })
  async retryJob(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: ActiveUser,
  ) {
    const job = await this.contentJobService.retryJob(id, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Job retry initiated successfully',
      data: job,
    };
  }
}