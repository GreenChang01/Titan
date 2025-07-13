import {Processor, Process} from '@nestjs/bull';
import {Job} from 'bull';
import {Logger} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository} from '@mikro-orm/core';
import {ContentJob} from '../entities/content-job.entity';
import {ContentJobService} from '../content-job.service';
import {MediaProcessingService} from '../services/media-processing.service';
import {JobStatus} from '../../common/enums';

export type MediaProcessingJobData = {
	jobId: string;
	userId: string;
	batchIndex?: number;
	totalBatch?: number;
	isRetry?: boolean;
};

@Processor('media-processing')
export class MediaProcessingProcessor {
	private readonly logger = new Logger(MediaProcessingProcessor.name);

	constructor(
		@InjectRepository(ContentJob)
		private readonly jobRepository: EntityRepository<ContentJob>,
		private readonly contentJobService: ContentJobService,
		private readonly mediaProcessingService: MediaProcessingService,
	) {}

	@Process('process-content')
	async processContent(job: Job<MediaProcessingJobData>): Promise<void> {
		const {jobId, userId, batchIndex, totalBatch, isRetry} = job.data;

		this.logger.log(`Starting content processing for job ${jobId}`
			+ (batchIndex === undefined ? '' : ` (batch ${batchIndex + 1}/${totalBatch})`)
			+ (isRetry ? ' (retry)' : ''));

		try {
			// 获取任务信息
			const contentJob = await this.jobRepository.findOne({id: jobId});
			if (!contentJob) {
				throw new Error(`Content job ${jobId} not found`);
			}

			// 更新任务状态为处理中
			await this.contentJobService.updateJobStatus(jobId, JobStatus.PROCESSING, 0);

			// 更新Bull队列进度
			await job.progress(10);

			// 执行媒体处理
			const result = await this.mediaProcessingService.processContentJob(contentJob);

			if (result.success) {
				// 设置输出路径
				if (result.outputPath) {
					await this.contentJobService.setJobOutput(jobId, result.outputPath);
				}

				// 更新任务状态为完成
				await this.contentJobService.updateJobStatus(jobId, JobStatus.COMPLETED, 100);
				await job.progress(100);

				this.logger.log(`Content job ${jobId} completed successfully in ${result.processingTime}ms`);
			} else {
				// 处理失败
				await this.contentJobService.updateJobStatus(jobId, JobStatus.FAILED, undefined, result.error);

				throw new Error(result.error || 'Unknown processing error');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			const errorStack = error instanceof Error ? error.stack : undefined;
			this.logger.error(`Content job ${jobId} failed:`, errorMessage, errorStack);

			// 更新任务状态为失败
			await this.contentJobService.updateJobStatus(jobId, JobStatus.FAILED, undefined, errorMessage);

			// 重新抛出错误，让Bull队列处理重试逻辑
			throw error;
		}
	}

	/**
	 * Bull队列全局错误处理
	 */
	@Process('*')
	async handleFailedJob(job: Job): Promise<void> {
		this.logger.error(`Job ${job.id} failed after all retries`);

		if (job.data?.jobId) {
			await this.contentJobService.updateJobStatus(
				job.data.jobId,
				JobStatus.FAILED,
				undefined,
				'Job failed after maximum retry attempts',
			);
		}
	}
}
