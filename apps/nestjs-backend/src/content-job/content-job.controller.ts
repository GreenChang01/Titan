import {Controller, Post, Get, Body, Param, Query, UseGuards, HttpStatus, ParseUUIDPipe} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery} from '@nestjs/swagger';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {User} from '../auth/decorators/user.decorator';
import {ActiveUser} from '../auth/types/active-user.type';
import {JobStatus} from '../common/enums';
import {ContentJobService} from './content-job.service';
import {CreateContentJobDto, CreateBatchJobDto} from './dto';

/**
 * 内容生产任务控制器
 * 负责处理ASMR内容的自动化生产任务，包括单个任务创建、批量任务管理、
 * 任务状态监控和进度跟踪等功能
 */
@ApiTags('内容生产任务')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class ContentJobController {
  constructor(private readonly contentJobService: ContentJobService) {}

  /**
   * 创建单个内容生产任务
   * 基于指定模板和参数创建单个ASMR内容生产任务，包括音频合成、视频生成等
   */
  @Post('create-single')
  @ApiOperation({
    summary: '创建单个内容生产任务',
    description: '根据指定的内容模板和个性化参数创建单个ASMR内容生产任务，支持语音合成、音景混合、视频生成等完整流程',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '内容生产任务创建成功，返回任务详情和执行状态',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '任务参数验证失败或模板不存在',
  })
  async createSingleJob(@Body() createJobDto: CreateContentJobDto, @User() user: ActiveUser) {
    const job = await this.contentJobService.createSingleJob(createJobDto, user.userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: '内容生产任务创建成功',
      data: job,
    };
  }

  /**
   * 创建批量内容生产任务
   * 根据模板和参数变量批量创建多个ASMR内容，适用于大规模内容生产需求
   */
  @Post('create-batch')
  @ApiOperation({
    summary: '创建批量内容生产任务',
    description: '根据内容模板和变量组合批量创建多个ASMR内容生产任务，支持不同语音、音景、文案的组合生成',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '批量任务创建成功，返回所有任务的概览信息',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '批量任务参数错误或超出数量限制',
  })
  async createBatchJobs(@Body() createBatchDto: CreateBatchJobDto, @User() user: ActiveUser) {
    const jobs = await this.contentJobService.createBatchJobs(createBatchDto, user.userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: '批量任务创建成功',
      data: jobs,
    };
  }

  /**
   * 获取用户的内容生产任务列表
   * 分页查询用户的所有内容生产任务，支持按状态、项目等条件过滤
   */
  @Get()
  @ApiOperation({
    summary: '获取任务列表',
    description: '分页查询用户的内容生产任务，支持按任务状态、所属项目、创建时间等条件过滤和排序',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '任务列表获取成功，返回分页数据和任务摘要信息',
  })
  @ApiQuery({name: 'status', enum: JobStatus, required: false, description: '任务状态过滤'})
  @ApiQuery({name: 'projectId', type: String, required: false, description: '项目ID过滤'})
  @ApiQuery({name: 'page', type: Number, required: false, example: 1, description: '页码，从1开始'})
  @ApiQuery({name: 'limit', type: Number, required: false, example: 20, description: '每页数量，最大100'})
  async getJobs(
    @User() user: ActiveUser,
    @Query('status') status?: JobStatus,
    @Query('projectId') projectId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const jobs = await this.contentJobService.getJobs(user.userId, {
      status,
      projectId,
      page,
      limit,
    });
    return {
      statusCode: HttpStatus.OK,
      message: '任务列表获取成功',
      data: jobs,
    };
  }

  /**
   * 获取内容生产任务详情
   * 查看指定任务的详细信息，包括配置参数、执行状态、输出结果等
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取任务详情',
    description: '查看指定内容生产任务的完整信息，包括任务配置、执行进度、生成结果、错误信息等详细数据',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '任务详情获取成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '任务不存在或无访问权限',
  })
  async getJobById(@Param('id', ParseUUIDPipe) id: string, @User() user: ActiveUser) {
    const job = await this.contentJobService.getJobById(id, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: '任务详情获取成功',
      data: job,
    };
  }

  /**
   * 获取任务执行进度
   * 实时查看任务的处理进度，包括各个处理阶段的完成状态和剩余时间估算
   */
  @Get(':id/progress')
  @ApiOperation({
    summary: '获取任务执行进度',
    description: '实时监控内容生产任务的执行进度，包括音频生成、视频合成、质量检查等各阶段的完成情况',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '任务进度获取成功，返回详细的进度信息和预计完成时间',
  })
  async getJobProgress(@Param('id', ParseUUIDPipe) id: string, @User() user: ActiveUser) {
    const progress = await this.contentJobService.getJobProgress(id, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: '任务进度获取成功',
      data: progress,
    };
  }

  /**
   * 重试失败的任务
   * 对执行失败的内容生产任务进行重新执行，支持从失败的步骤开始恢复
   */
  @Post(':id/retry')
  @ApiOperation({
    summary: '重试失败任务',
    description: '重新执行失败的内容生产任务，系统会自动从失败的步骤开始恢复，避免重复执行已完成的阶段',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '任务重试启动成功，返回新的任务状态',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '任务状态不允许重试或已达到最大重试次数',
  })
  async retryJob(@Param('id', ParseUUIDPipe) id: string, @User() user: ActiveUser) {
    const job = await this.contentJobService.retryJob(id, user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: '任务重试启动成功',
      data: job,
    };
  }
}
