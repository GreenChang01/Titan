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
}
