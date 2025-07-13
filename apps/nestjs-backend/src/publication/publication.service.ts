import {Injectable, Logger, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository, EntityManager as CoreEntityManager} from '@mikro-orm/core';
import {EntityManager} from '@mikro-orm/postgresql';
import {ContentJob} from '../content-job/entities/content-job.entity';
import {JobStatus} from '../common/enums';
import {Publication, PublicationStatus} from './entities/publication.entity';
import {CreatePublicationDto} from './dto';

@Injectable()
export class PublicationService {
	private readonly logger = new Logger(PublicationService.name);

	constructor(
		@InjectRepository(Publication)
		private readonly publicationRepository: EntityRepository<Publication>,
		@InjectRepository(ContentJob)
		private readonly contentJobRepository: EntityRepository<ContentJob>,
		private readonly em: EntityManager,
	) {}

	/**
   * 创建发布记录
   */
	async createPublication(createDto: CreatePublicationDto, userId: string): Promise<Publication> {
		// 验证ContentJob是否存在且已完成
		const contentJob = await this.contentJobRepository.findOne({
			id: createDto.contentJobId,
			userId,
			status: JobStatus.COMPLETED,
		});

		if (!contentJob) {
			throw new NotFoundException('Content job not found or not completed');
		}

		const publication = new Publication();
		publication.contentJobId = createDto.contentJobId;
		publication.platform = createDto.platform;
		publication.publishConfig = createDto.publishConfig || {};
		publication.status = PublicationStatus.PENDING_MANUAL_UPLOAD;

		if (createDto.scheduledAt) {
			publication.scheduledAt = new Date(createDto.scheduledAt);
		}

		await this.em.persistAndFlush(publication);
		this.logger.log(`Publication created: ${publication.id} for job: ${contentJob.id}`);

		return publication;
	}

	/**
   * 获取用户的发布列表
   */
	async getPublications(userId: string): Promise<Publication[]> {
		// 获取用户的所有ContentJob IDs
		const contentJobIds = await this.em.createQueryBuilder(ContentJob, 'cj')
			.select('cj.id')
			.where({userId})
			.getResult();

		const jobIds = contentJobIds.map(job => job.id);

		// 通过ContentJob关联查找用户的发布记录
		return this.publicationRepository.find(
			{
				contentJobId: {$in: jobIds},
			},
			{
				orderBy: {createdAt: 'DESC'},
			},
		);
	}

	/**
   * 获取发布详情
   */
	async getPublicationById(publicationId: string, userId: string): Promise<Publication> {
		const publication = await this.publicationRepository.findOne({id: publicationId});

		if (!publication) {
			throw new NotFoundException('Publication not found');
		}

		// 验证用户权限
		const contentJob = await this.contentJobRepository.findOne({
			id: publication.contentJobId,
			userId,
		});

		if (!contentJob) {
			throw new NotFoundException('Publication not found or access denied');
		}

		return publication;
	}

	/**
   * 更新发布状态（手动上传完成后调用）
   */
	async updatePublicationStatus(
		publicationId: string,
		status: PublicationStatus,
		userId: string,
		platformPostId?: string,
	): Promise<Publication> {
		const publication = await this.getPublicationById(publicationId, userId);

		publication.status = status;
		if (platformPostId) {
			publication.platformPostId = platformPostId;
		}

		if (status === PublicationStatus.PUBLISHED) {
			publication.publishedAt = new Date();
		}

		await this.em.persistAndFlush(publication);
		this.logger.log(`Publication ${publicationId} status updated to: ${status}`);

		return publication;
	}

	/**
   * 获取生成的视频文件路径
   */
	async getVideoFilePath(publicationId: string, userId: string): Promise<string> {
		const publication = await this.getPublicationById(publicationId, userId);

		const contentJob = await this.contentJobRepository.findOne({
			id: publication.contentJobId,
		});

		if (!contentJob || !contentJob.outputPath) {
			throw new NotFoundException('Video file not found');
		}

		return contentJob.outputPath;
	}
}
