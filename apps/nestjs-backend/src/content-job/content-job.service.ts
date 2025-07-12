import {Injectable, Logger, NotFoundException, BadRequestException} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository, EntityManager} from '@mikro-orm/core';
import {InjectQueue} from '@nestjs/bull';
import {Queue} from 'bull';
import {JobStatus, JobType} from '../common/enums';
import {ContentJob} from './entities/content-job.entity';
import {CreateContentJobDto, CreateBatchJobDto} from './dto';

export type JobQueryOptions = {
  status?: JobStatus;
  projectId?: string;
  page?: number;
  limit?: number;
}

export type JobProgressData = {
  id: string;
  status: JobStatus;
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  processingTime?: number;
  errorMessage?: string;
}

@Injectable()
export class ContentJobService {
  private readonly logger = new Logger(ContentJobService.name);

  constructor(
    @InjectRepository(ContentJob)
    private readonly jobRepository: EntityRepository<ContentJob>,
    private readonly em: EntityManager,
    @InjectQueue('media-processing')
    private readonly mediaQueue: Queue,
    @InjectQueue('audio-generation')
    private readonly audioQueue: Queue,
  ) {}

  /**
   * 创建单个内容生产任务
   */
  async createSingleJob(createJobDto: CreateContentJobDto, userId: string): Promise<ContentJob> {
    const job = new ContentJob();
    job.userId = userId;
    job.projectId = createJobDto.projectId;
    job.templateId = createJobDto.templateId;
    job.jobType = JobType.SINGLE;
    job.inputAssets = createJobDto.inputAssets;
    job.status = JobStatus.QUEUED;

    await this.em.persistAndFlush(job);

    // 添加到队列进行处理
    await this.mediaQueue.add(
      'process-content',
      {
        jobId: job.id,
        userId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    this.logger.log(`Single content job created: ${job.id}`);
    return job;
  }

  /**
   * 创建批量内容生产任务
   */
  async createBatchJobs(createBatchDto: CreateBatchJobDto, userId: string): Promise<ContentJob[]> {
    const jobs: ContentJob[] = [];

    for (const jobDto of createBatchDto.jobs) {
      const job = new ContentJob();
      job.userId = userId;
      job.projectId = jobDto.projectId;
      job.templateId = jobDto.templateId;
      job.jobType = JobType.BATCH;
      job.inputAssets = jobDto.inputAssets;
      job.status = JobStatus.QUEUED;
      jobs.push(job);
    }

    await this.em.persistAndFlush(jobs);

    // 批量添加到队列
    const queueJobs = jobs.map((job, index) => ({
      name: 'process-content',
      data: {
        jobId: job.id,
        userId,
        batchIndex: index,
        totalBatch: jobs.length,
      },
      opts: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        delay: index * 1000, // 错开执行时间
      },
    }));

    await this.mediaQueue.addBulk(queueJobs);

    this.logger.log(`Batch content jobs created: ${jobs.length} jobs`);
    return jobs;
  }

  /**
   * 获取任务列表
   */
  async getJobs(
    userId: string,
    options: JobQueryOptions,
  ): Promise<{
      data: ContentJob[];
      total: number;
      page: number;
      limit: number;
    }> {
    const {status, projectId, page = 1, limit = 20} = options;
    const offset = (page - 1) * limit;

    const where: any = {userId};
    if (status) {
      where.status = status;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const [jobs, total] = await this.jobRepository.findAndCount(where, {
      orderBy: {createdAt: 'DESC'},
      limit,
      offset,
    });

    return {
      data: jobs,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取任务详情
   */
  async getJobById(jobId: string, userId: string): Promise<ContentJob> {
    const job = await this.jobRepository.findOne({
      id: jobId,
      userId,
    });

    if (!job) {
      throw new NotFoundException('Job not found or access denied');
    }

    return job;
  }

  /**
   * 获取任务进度
   */
  async getJobProgress(jobId: string, userId: string): Promise<JobProgressData> {
    const job = await this.getJobById(jobId, userId);

    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      processingTime: job.processingTime,
      errorMessage: job.errorMessage,
    };
  }

  /**
   * 重试失败的任务
   */
  async retryJob(jobId: string, userId: string): Promise<ContentJob> {
    const job = await this.getJobById(jobId, userId);

    if (job.status !== JobStatus.FAILED) {
      throw new BadRequestException('Only failed jobs can be retried');
    }

    // 重置任务状态
    job.status = JobStatus.QUEUED;
    job.progress = 0;
    job.errorMessage = undefined;
    job.startedAt = undefined;
    job.completedAt = undefined;
    job.processingTime = undefined;

    await this.em.persistAndFlush(job);

    // 重新添加到队列
    await this.mediaQueue.add(
      'process-content',
      {
        jobId: job.id,
        userId,
        isRetry: true,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    this.logger.log(`Job retry initiated: ${jobId}`);
    return job;
  }

  /**
   * 更新任务状态
   */
  async updateJobStatus(jobId: string, status: JobStatus, progress?: number, errorMessage?: string): Promise<void> {
    const job = await this.jobRepository.findOne({id: jobId});
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    job.status = status;
    if (progress !== undefined) {
      job.progress = progress;
    }

    if (errorMessage !== undefined) {
      job.errorMessage = errorMessage;
    }

    if (status === JobStatus.PROCESSING && !job.startedAt) {
      job.startedAt = new Date();
    }

    if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
      job.completedAt = new Date();
      if (job.startedAt) {
        job.processingTime = Date.now() - job.startedAt.getTime();
      }
    }

    await this.em.persistAndFlush(job);
  }

  /**
   * 设置任务输出路径
   */
  async setJobOutput(jobId: string, outputPath: string): Promise<void> {
    const job = await this.jobRepository.findOne({id: jobId});
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    job.outputPath = outputPath;
    await this.em.persistAndFlush(job);
  }

  /**
   * 创建ASMR音频生成任务
   */
  async createASMRAudioJob(
    text: string,
    userId: string,
    options: {
      duration?: number;
      voicePreset?: string;
      soundscapeType?: string;
      projectId?: string;
    } = {},
  ): Promise<{jobId: string; queueJobId: string}> {
    const {duration = 30, voicePreset = 'ELDERLY_FRIENDLY', soundscapeType = 'RAIN_FOREST', projectId} = options;

    // 创建数据库任务记录
    const job = new ContentJob();
    job.userId = userId;
    job.projectId = projectId;
    job.jobType = JobType.SINGLE;
    job.status = JobStatus.QUEUED;
    job.inputAssets = [
      {
        assetId: 'text',
        slotName: 'text_content',
        parameters: {text, duration, voicePreset, soundscapeType},
      },
    ];

    await this.em.persistAndFlush(job);

    // 生成输出路径
    const outputDir = `/tmp/titan/audio/${job.id}`;
    const outputPath = `${outputDir}/asmr_${Date.now()}.mp3`;

    // 添加到音频生成队列
    const queueJob = await this.audioQueue.add(
      'generate-asmr',
      {
        jobId: job.id,
        text,
        duration,
        voicePreset,
        soundscapeType,
        outputPath,
      },
      {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    this.logger.log(`ASMR audio job created: ${job.id}, queue job: ${queueJob.id}`);

    return {
      jobId: job.id,
      queueJobId: queueJob.id.toString(),
    };
  }

  /**
   * 创建语音生成任务
   */
  async createVoiceGenerationJob(
    text: string,
    userId: string,
    options: {
      voicePreset?: string;
      projectId?: string;
    } = {},
  ): Promise<{jobId: string; queueJobId: string}> {
    const {voicePreset = 'ELDERLY_FRIENDLY', projectId} = options;

    // 创建数据库任务记录
    const job = new ContentJob();
    job.userId = userId;
    job.projectId = projectId;
    job.jobType = JobType.SINGLE;
    job.status = JobStatus.QUEUED;
    job.inputAssets = [
      {
        assetId: 'text',
        slotName: 'text_content',
        parameters: {text, voicePreset},
      },
    ];

    await this.em.persistAndFlush(job);

    // 生成输出路径
    const outputDir = `/tmp/titan/audio/${job.id}`;
    const outputPath = `${outputDir}/voice_${Date.now()}.mp3`;

    // 添加到音频生成队列
    const queueJob = await this.audioQueue.add(
      'generate-voice',
      {
        jobId: job.id,
        text,
        voicePreset,
        outputPath,
      },
      {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    );

    this.logger.log(`Voice generation job created: ${job.id}, queue job: ${queueJob.id}`);

    return {
      jobId: job.id,
      queueJobId: queueJob.id.toString(),
    };
  }

  /**
   * 创建音景生成任务
   */
  async createSoundscapeGenerationJob(
    prompt: string,
    userId: string,
    options: {
      duration?: number;
      soundscapeType?: string;
      projectId?: string;
    } = {},
  ): Promise<{jobId: string; queueJobId: string}> {
    const {duration = 30, soundscapeType = 'RAIN_FOREST', projectId} = options;

    // 创建数据库任务记录
    const job = new ContentJob();
    job.userId = userId;
    job.projectId = projectId;
    job.jobType = JobType.SINGLE;
    job.status = JobStatus.QUEUED;
    job.inputAssets = [
      {
        assetId: 'prompt',
        slotName: 'soundscape_prompt',
        parameters: {prompt, duration, soundscapeType},
      },
    ];

    await this.em.persistAndFlush(job);

    // 生成输出路径
    const outputDir = `/tmp/titan/audio/${job.id}`;
    const outputPath = `${outputDir}/soundscape_${Date.now()}.mp3`;

    // 添加到音频生成队列
    const queueJob = await this.audioQueue.add(
      'generate-soundscape',
      {
        jobId: job.id,
        text: prompt,
        duration,
        soundscapeType,
        outputPath,
      },
      {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    );

    this.logger.log(`Soundscape generation job created: ${job.id}, queue job: ${queueJob.id}`);

    return {
      jobId: job.id,
      queueJobId: queueJob.id.toString(),
    };
  }
}
