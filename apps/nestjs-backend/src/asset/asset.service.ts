import * as path from 'node:path';
import {promises as fsPromises} from 'node:fs';
import {Injectable, Logger, NotFoundException, ForbiddenException} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository} from '@mikro-orm/core';
import {EntityManager} from '@mikro-orm/postgresql';
import {ConfigService} from '@nestjs/config';
import {v4 as uuidv4} from 'uuid';
import {ConfigKey} from '../config/config-key.enum';
import {AssetType, UploadSource} from '../common/enums';
import {Asset} from './entities/asset.entity';
import {UploadAssetDto, AssetSearchDto, UpdateAssetDto, BatchOperationDto, BatchOperationType} from './dto';
import {ThumbnailService} from './services/thumbnail.service';
import {MetadataExtractorService} from './services/metadata-extractor.service';

type PaginatedResult<T> = {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

@Injectable()
export class AssetService {
	private readonly logger = new Logger(AssetService.name);
	private readonly uploadDir: string;

	constructor(
		@InjectRepository(Asset)
		private readonly assetRepository: EntityRepository<Asset>,
		private readonly em: EntityManager,
		private readonly thumbnailService: ThumbnailService,
		private readonly metadataExtractorService: MetadataExtractorService,
		private readonly configService: ConfigService,
	) {
		this.uploadDir = this.configService.get<string>(ConfigKey.UPLOAD_DIR) || './uploads';
	}

	async uploadFile(file: Express.Multer.File, userId: string, uploadAssetDto: UploadAssetDto): Promise<Asset> {
		try {
			// Ensure upload directory exists
			await fsPromises.mkdir(this.uploadDir, {recursive: true});

			// Generate unique filename
			const fileExtension = path.extname(file.originalname);
			const uniqueFileName = `${uuidv4()}${fileExtension}`;
			const filePath = path.join(this.uploadDir, uniqueFileName);

			// Save file to disk
			await fsPromises.writeFile(filePath, file.buffer);

			// Extract metadata
			const metadata = await this.metadataExtractorService.extractMetadata(filePath);

			// Generate thumbnail
			const thumbnailPath = await this.thumbnailService.generateThumbnail(filePath);

			// Create asset entity
			const asset = new Asset({
				userId,
				fileName: uniqueFileName,
				originalName: file.originalname,
				filePath,
				fileSize: file.size,
				mimeType: file.mimetype,
				assetType: uploadAssetDto.assetType,
				uploadSource: UploadSource.LOCAL,
			});

			// Set optional properties
			if (uploadAssetDto.tags) {
				asset.tags = uploadAssetDto.tags;
			}

			if (uploadAssetDto.description) {
				asset.description = uploadAssetDto.description;
			}

			asset.metadata = metadata;
			if (thumbnailPath) {
				asset.thumbnailPath = thumbnailPath;
			}

			await this.em.persistAndFlush(asset);

			this.logger.log(`Asset uploaded successfully: ${asset.id}`);
			return asset;
		} catch (error) {
			this.logger.error('Failed to upload asset:', error);
			throw error;
		}
	}

	async searchAssets(userId: string, query: AssetSearchDto): Promise<PaginatedResult<Asset>> {
		const qb = this.em.createQueryBuilder(Asset, 'a').where({userId});

		// Apply filters
		if (query.assetType) {
			qb.andWhere({assetType: query.assetType});
		}

		if (query.tags && query.tags.length > 0) {
			qb.andWhere({tags: {$overlap: query.tags}});
		}

		if (query.searchKeyword) {
			qb.andWhere({
				$or: [
					{originalName: {$ilike: `%${query.searchKeyword}%`}},
					{description: {$ilike: `%${query.searchKeyword}%`}},
					{tags: {$overlap: [query.searchKeyword]}},
				],
			});
		}

		// Apply sorting
		const sortField = query.sortBy || 'createdAt';
		const sortOrder = query.sortOrder || 'DESC';
		qb.orderBy({[sortField]: sortOrder});

		// Apply pagination
		const page = query.page || 1;
		const pageSize = query.pageSize || 20;
		const offset = (page - 1) * pageSize;

		qb.limit(pageSize).offset(offset);

		const [data, total] = await qb.getResultAndCount();

		return {
			data,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	}

	async getAssetById(assetId: string, userId: string): Promise<Asset> {
		const asset = await this.assetRepository.findOne({id: assetId, userId});
		if (!asset) {
			throw new NotFoundException(`Asset with ID ${assetId} not found`);
		}

		return asset;
	}

	async updateAsset(assetId: string, userId: string, updateDto: UpdateAssetDto): Promise<Asset> {
		const asset = await this.getAssetById(assetId, userId);

		if (updateDto.description !== undefined) {
			asset.description = updateDto.description;
		}

		if (updateDto.tags !== undefined) {
			asset.tags = updateDto.tags;
		}

		if (updateDto.assetType !== undefined) {
			asset.assetType = updateDto.assetType;
		}

		await this.em.persistAndFlush(asset);
		return asset;
	}

	async deleteAsset(assetId: string, userId: string): Promise<void> {
		const asset = await this.getAssetById(assetId, userId);

		// Delete files from disk
		try {
			try {
				await fsPromises.access(asset.filePath);
				await fsPromises.unlink(asset.filePath);
			} catch {
				// File doesn't exist, ignore
			}

			if (asset.thumbnailPath) {
				try {
					await fsPromises.access(asset.thumbnailPath);
					await fsPromises.unlink(asset.thumbnailPath);
				} catch {
					// Thumbnail doesn't exist, ignore
				}
			}
		} catch (error) {
			this.logger.warn(`Failed to delete files for asset ${assetId}:`, error);
		}

		await this.em.removeAndFlush(asset);
		this.logger.log(`Asset deleted: ${assetId}`);
	}

	async batchOperations(userId: string, batchDto: BatchOperationDto): Promise<{success: number; failed: number}> {
		const assets = await this.assetRepository.find({
			id: {$in: batchDto.assetIds},
			userId,
		});

		if (assets.length !== batchDto.assetIds.length) {
			throw new ForbiddenException('Some assets not found or access denied');
		}

		let success = 0;
		let failed = 0;

		for (const asset of assets) {
			try {
				switch (batchDto.operation) {
					case BatchOperationType.DELETE: {
						await this.deleteAsset(asset.id, userId);
						break;
					}

					case BatchOperationType.UPDATE_TAGS: {
						if (batchDto.tags) {
							asset.tags = batchDto.tags;
							await this.em.persistAndFlush(asset);
						}

						break;
					}

					case BatchOperationType.UPDATE_TYPE: {
						if (batchDto.assetType) {
							asset.assetType = batchDto.assetType as AssetType;
							await this.em.persistAndFlush(asset);
						}

						break;
					}
				}

				success++;
			} catch (error) {
				this.logger.error(`Batch operation failed for asset ${asset.id}:`, error);
				failed++;
			}
		}

		return {success, failed};
	}

	async getAssetsByType(userId: string, assetType: AssetType): Promise<Asset[]> {
		return this.assetRepository.find({userId, assetType});
	}

	async getAssetsByTags(userId: string, tags: string[]): Promise<Asset[]> {
		return this.assetRepository.find({
			userId,
			tags: {$overlap: tags},
		});
	}

	async getAssetsByProject(userId: string, projectId: string): Promise<Asset[]> {
		// This would require a join with ProjectAsset entity
		// For now, implementing a simpler version
		return this.assetRepository.find({userId});
	}

	/**
	 * ASMR专用功能 - 获取ASMR相关素材
	 * @param userId 用户ID
	 * @param category ASMR分类(可选)
	 * @returns ASMR素材列表
	 */
	async getASMRAssets(userId: string, category?: string): Promise<Asset[]> {
		const asmrTypes = [
			AssetType.ASMR_NATURAL_SOUND,
			AssetType.ASMR_WHITE_NOISE,
			AssetType.ASMR_AMBIENT_SOUND,
			AssetType.ASMR_VOICE_SAMPLE,
		];

		const where: any = {
			userId,
			assetType: {$in: asmrTypes},
		};

		// 如果指定了分类，则通过标签过滤
		if (category) {
			where.tags = {$contains: [category]};
		}

		// eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
		return this.assetRepository.find(where, {
			orderBy: {createdAt: 'DESC'},
		});
	}

	/**
	 * ASMR专用功能 - 按情绪分类获取素材
	 * @param userId 用户ID
	 * @param mood 情绪类型(relaxing, energizing, sleeping等)
	 * @returns 符合情绪的素材列表
	 */
	async getASMRAssetsByMood(userId: string, mood: string): Promise<Asset[]> {
		const asmrTypes = [
			AssetType.ASMR_NATURAL_SOUND,
			AssetType.ASMR_WHITE_NOISE,
			AssetType.ASMR_AMBIENT_SOUND,
			AssetType.ASMR_VOICE_SAMPLE,
		];

		return this.assetRepository.find(
			{
				userId,
				assetType: {$in: asmrTypes},
				tags: {$contains: [mood]},
			},
			{
				orderBy: {createdAt: 'DESC'},
			},
		);
	}

	/**
	 * ASMR专用功能 - 创建AI生成的ASMR素材
	 * @param userId 用户ID
	 * @param assetData 素材数据
	 * @returns 创建的素材
	 */
	async createAIGeneratedAsset(
		userId: string,
		assetData: {
			name: string;
			type: AssetType;
			url: string;
			metadata?: Record<string, any>;
			tags?: string[];
			description?: string;
		},
	): Promise<Asset> {
		try {
			const asset = new Asset({
				userId,
				fileName: assetData.name,
				originalName: assetData.name,
				filePath: assetData.url,
				fileSize: 0, // AI生成的资源没有本地文件大小
				mimeType: this.getMimeTypeFromAssetType(assetData.type),
				assetType: assetData.type,
				uploadSource: UploadSource.AI_GENERATED,
			});

			// 设置可选属性
			if (assetData.metadata) {
				asset.metadata = assetData.metadata;
			}

			if (assetData.tags) {
				asset.tags = assetData.tags;
			}

			if (assetData.description) {
				asset.description = assetData.description;
			}

			// 设置URL而不是本地路径
			asset.url = assetData.url;

			await this.em.persistAndFlush(asset);

			this.logger.log(`AI生成素材创建成功: ${asset.id} for user: ${userId}`);
			return asset;
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`创建AI生成素材失败: ${error.message}`, error.stack);
			} else {
				this.logger.error('创建AI生成素材失败: Unknown error', error);
			}

			throw error;
		}
	}

	/**
	 * ASMR专用功能 - 获取素材统计信息
	 * @param userId 用户ID
	 * @returns 统计信息
	 */
	async getASMRAssetStats(userId: string): Promise<{
		totalCount: number;
		byType: Record<string, number>;
		byMood: Record<string, number>;
		recentUploads: number;
	}> {
		try {
			const asmrTypes = [
				AssetType.ASMR_NATURAL_SOUND,
				AssetType.ASMR_WHITE_NOISE,
				AssetType.ASMR_AMBIENT_SOUND,
				AssetType.ASMR_VOICE_SAMPLE,
			];

			// 总数统计
			const totalCount = await this.assetRepository.count({
				userId,
				assetType: {$in: asmrTypes},
			});

			// 按类型统计
			const byTypeResult = await this.em.getConnection().execute(
				`SELECT asset_type, COUNT(*) as count 
				 FROM asset 
				 WHERE user_id = ? AND asset_type IN (?, ?, ?, ?) 
				 GROUP BY asset_type`,
				[userId, ...asmrTypes],
			);

			const byType: Record<string, number> = {};
			for (const row of byTypeResult) {
				byType[row.asset_type] = Number.parseInt(row.count, 10);
			}

			// 按情绪统计 - 通过标签统计
			const byMoodResult = await this.em.getConnection().execute(
				`SELECT UNNEST(tags) as mood, COUNT(*) as count 
				 FROM asset 
				 WHERE user_id = ? AND asset_type IN (?, ?, ?, ?) AND tags IS NOT NULL
				 GROUP BY mood 
				 ORDER BY count DESC 
				 LIMIT 10`,
				[userId, ...asmrTypes],
			);

			const byMood: Record<string, number> = {};
			for (const row of byMoodResult) {
				byMood[row.mood] = Number.parseInt(row.count, 10);
			}

			// 最近7天上传数量
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			const recentUploads = await this.assetRepository.count({
				userId,
				assetType: {$in: asmrTypes},
				createdAt: {$gte: sevenDaysAgo},
			});

			return {
				totalCount,
				byType,
				byMood,
				recentUploads,
			};
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`获取ASMR素材统计失败: ${error.message}`, error.stack);
			} else {
				this.logger.error('获取ASMR素材统计失败: Unknown error', error);
			}

			throw error;
		}
	}

	/**
	 * 根据素材类型获取MIME类型
	 * @param assetType 素材类型
	 * @returns MIME类型
	 */
	private getMimeTypeFromAssetType(assetType: AssetType): string {
		switch (assetType) {
			case AssetType.ASMR_NATURAL_SOUND:
			case AssetType.ASMR_WHITE_NOISE:
			case AssetType.ASMR_AMBIENT_SOUND:
			case AssetType.ASMR_VOICE_SAMPLE: {
				return 'audio/mpeg';
			}

			case AssetType.AI_GENERATED_IMAGE: {
				return 'image/jpeg';
			}

			default: {
				return 'application/octet-stream';
			}
		}
	}

	/**
	 * AI生成图片专用功能 - 获取AI生成的图片素材
	 * @param userId 用户ID
	 * @param page 页码
	 * @param pageSize 每页大小
	 * @returns AI生成图片的分页列表
	 */
	async getAIGeneratedImages(userId: string, page = 1, pageSize = 20): Promise<PaginatedResult<Asset>> {
		const qb = this.em.createQueryBuilder(Asset, 'asset');

		qb.where({
			userId,
			assetType: AssetType.AI_GENERATED_IMAGE,
			uploadSource: UploadSource.AI_GENERATED,
		});

		qb.orderBy({createdAt: 'DESC'});

		const offset = (page - 1) * pageSize;
		qb.limit(pageSize).offset(offset);

		const [data, total] = await qb.getResultAndCount();

		return {
			data,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	}

	/**
	 * AI生成图片专用功能 - 按提示词搜索AI生成的图片
	 * @param userId 用户ID
	 * @param prompt 提示词关键字
	 * @param page 页码
	 * @param pageSize 每页大小
	 * @returns 匹配的AI生成图片列表
	 */
	async searchAIGeneratedImagesByPrompt(
		userId: string,
		prompt: string,
		page = 1,
		pageSize = 20,
	): Promise<PaginatedResult<Asset>> {
		const qb = this.em.createQueryBuilder(Asset, 'asset');

		qb.where({
			userId,
			assetType: AssetType.AI_GENERATED_IMAGE,
			uploadSource: UploadSource.AI_GENERATED,
		});

		// 在描述和元数据中搜索提示词
		qb.andWhere({
			$or: [
				{description: {$ilike: `%${prompt}%`}},
				{originalName: {$ilike: `%${prompt}%`}},
				{'metadata.prompt': {$ilike: `%${prompt}%`}},
			],
		});

		qb.orderBy({createdAt: 'DESC'});

		const offset = (page - 1) * pageSize;
		qb.limit(pageSize).offset(offset);

		const [data, total] = await qb.getResultAndCount();

		return {
			data,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	}

	/**
	 * AI生成图片专用功能 - 获取AI生成图片的统计信息
	 * @param userId 用户ID
	 * @returns AI生成图片的统计信息
	 */
	async getAIGeneratedImageStats(userId: string): Promise<{
		totalCount: number;
		todayCount: number;
		weekCount: number;
		monthCount: number;
		topTags: Array<{tag: string; count: number}>;
	}> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const weekAgo = new Date(today);
		weekAgo.setDate(weekAgo.getDate() - 7);

		const monthAgo = new Date(today);
		monthAgo.setMonth(monthAgo.getMonth() - 1);

		const baseQuery = {
			userId,
			assetType: AssetType.AI_GENERATED_IMAGE,
			uploadSource: UploadSource.AI_GENERATED,
		};

		const [totalCount, todayCount, weekCount, monthCount] = await Promise.all([
			this.assetRepository.count(baseQuery),
			this.assetRepository.count({
				...baseQuery,
				createdAt: {$gte: today},
			}),
			this.assetRepository.count({
				...baseQuery,
				createdAt: {$gte: weekAgo},
			}),
			this.assetRepository.count({
				...baseQuery,
				createdAt: {$gte: monthAgo},
			}),
		]);

		// 获取最常用的标签
		// eslint-disable-next-line unicorn/no-array-method-this-argument
		const assets = await this.assetRepository.find(baseQuery, {
			fields: ['tags'],
			limit: 1000,
		});

		const tagCounts = new Map<string, number>();
		for (const asset of assets) {
			for (const tag of asset.tags) {
				tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
			}
		}

		const topTags = [...tagCounts.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.map(([tag, count]) => ({tag, count}));

		return {
			totalCount,
			todayCount,
			weekCount,
			monthCount,
			topTags,
		};
	}
}
