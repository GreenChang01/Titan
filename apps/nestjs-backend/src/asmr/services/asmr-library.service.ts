import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository} from '@mikro-orm/core';
import {ASMRLibraryItem, GenerationStatus} from '../dto/asmr-generation.dto';
import {LibraryFilterDto, UpdateLibraryItemDto, LibraryStatsDto, BulkActionDto} from '../dto/asmr-library.dto';
import {ASMRGeneration} from '../entities/asmr-generation.entity';
import {LibraryItemFavorite} from '../entities/library-item-favorite.entity';
import {LibraryItemRating} from '../entities/library-item-rating.entity';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

@Injectable()
export class ASMRLibraryService {
	private readonly logger = new Logger(ASMRLibraryService.name);

	constructor(
		@InjectRepository(ASMRGeneration)
		private readonly asmrGenerationRepository: EntityRepository<ASMRGeneration>,
		@InjectRepository(LibraryItemFavorite)
		private readonly favoriteRepository: EntityRepository<LibraryItemFavorite>,
		@InjectRepository(LibraryItemRating)
		private readonly ratingRepository: EntityRepository<LibraryItemRating>,
	) {}

	async getLibraryItems(
		userId: string,
		filter: LibraryFilterDto = {},
	): Promise<{
		items: ASMRLibraryItem[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}> {
		const {search, category, status, tags, limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc'} = filter;

		// Build filter criteria
		const where: any = {user: {id: userId}};

		if (status) {
			where.status = status;
		}

		// Get items with basic filtering
		const [items, total] = await this.asmrGenerationRepository.findAndCount(where, {
			limit,
			offset,
			orderBy: {[sortBy]: sortOrder},
			populate: ['user'],
		});

		const libraryItems = await Promise.all(items.map(async (item) => this.mapToLibraryItem(item, userId)));

		return {
			items: libraryItems,
			total,
			page: Math.floor(offset / limit) + 1,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getLibraryItem(id: string, userId: string): Promise<ASMRLibraryItem | null> {
		const item = await this.asmrGenerationRepository.findOne(
			{
				id,
				user: {id: userId},
			},
			{populate: ['user']},
		);

		if (!item) {
			return null;
		}

		return this.mapToLibraryItem(item, userId);
	}

	async getLibraryStats(userId: string): Promise<LibraryStatsDto> {
		// Basic counts
		const totalItems = await this.asmrGenerationRepository.count({
			user: {id: userId},
		});
		const completedItems = await this.asmrGenerationRepository.count({
			user: {id: userId},
			status: GenerationStatus.COMPLETED,
		});
		const processingItems = await this.asmrGenerationRepository.count({
			user: {id: userId},
			status: GenerationStatus.PROCESSING,
		});
		const failedItems = await this.asmrGenerationRepository.count({
			user: {id: userId},
			status: GenerationStatus.FAILED,
		});

		// Favorites count
		const favoriteItems = await this.favoriteRepository.count({
			user: {id: userId},
			isFavorite: true,
		});

		// Get completed items for aggregates
		const completedGenerations = await this.asmrGenerationRepository.find({
			user: {id: userId},
			status: GenerationStatus.COMPLETED,
		});

		const totalDuration = completedGenerations.reduce((sum, gen) => sum + (gen.duration || 0), 0);
		const totalFileSize = completedGenerations.reduce((sum, gen) => sum + (gen.fileSize || 0), 0);
		const totalPlayCount = completedGenerations.reduce((sum, gen) => sum + (gen.playCount || 0), 0);

		// Get ratings for average
		const ratings = await this.ratingRepository.find({
			user: {id: userId},
		});
		const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

		// Mock popular tags for now
		const popularTags = [
			{tag: 'gentle', count: 10},
			{tag: 'sleep', count: 8},
			{tag: 'relaxing', count: 6},
		];

		// Get recent generations for activity
		const recentGenerations = await this.asmrGenerationRepository.find(
			{
				user: {id: userId},
			},
			{
				orderBy: {createdAt: 'DESC'},
				limit: 10,
			},
		);

		const recentActivity = recentGenerations.map((gen) => ({
			date: gen.createdAt,
			action: 'generated',
			count: 1,
		}));

		return {
			totalItems,
			completedItems,
			processingItems,
			failedItems,
			favoriteItems,
			totalDuration,
			totalFileSize,
			totalPlayCount,
			averageRating,
			popularTags,
			generationStats: {
				today: recentGenerations.filter((g) => g.createdAt.toDateString() === new Date().toDateString()).length,
				thisWeek: recentGenerations.length,
				thisMonth: recentGenerations.length,
				thisYear: recentGenerations.length,
			},
			usageStats: {
				totalGenerations: totalItems,
				totalCost: completedGenerations.reduce((sum, gen) => sum + (gen.cost || 0), 0),
				averageCostPerItem:
					totalItems > 0 ? completedGenerations.reduce((sum, gen) => sum + (gen.cost || 0), 0) / totalItems : 0,
				averageDuration: completedItems > 0 ? totalDuration / completedItems : 0,
				mostUsedVoiceType: 'gentle_female',
				mostUsedSoundscapeType: 'nature',
			},
			recentActivity,
		};
	}

	async updateLibraryItem(id: string, userId: string, updates: UpdateLibraryItemDto): Promise<ASMRLibraryItem> {
		const item = await this.asmrGenerationRepository.findOne({
			id,
			user: {id: userId},
		});

		if (!item) {
			throw new Error('Item not found');
		}

		// Apply updates
		if (updates.title) {
			item.title = updates.title;
		}

		if (updates.description !== undefined) {
			item.description = updates.description;
		}

		if (updates.tags) {
			item.tags = updates.tags;
		}

		if (updates.isPrivate !== undefined) {
			item.isPrivate = updates.isPrivate;
		}

		await this.asmrGenerationRepository.getEntityManager().persistAndFlush(item);
		return this.mapToLibraryItem(item, userId);
	}

	async deleteLibraryItem(id: string, userId: string): Promise<boolean> {
		const item = await this.asmrGenerationRepository.findOne({
			id,
			user: {id: userId},
		});

		if (!item) {
			return false;
		}

		// Delete associated file if it exists
		if (item.filePath) {
			try {
				await fs.unlink(item.filePath);
			} catch (error) {
				this.logger.warn(`Failed to delete file: ${item.filePath}`, error);
			}
		}

		await this.asmrGenerationRepository.getEntityManager().removeAndFlush(item);
		return true;
	}

	async toggleFavorite(id: string, userId: string, isFavorite?: boolean): Promise<boolean> {
		const item = await this.asmrGenerationRepository.findOne({
			id,
			user: {id: userId},
		});

		if (!item) {
			return false;
		}

		const existingFavorite = await this.favoriteRepository.findOne({
			item: {id},
			user: {id: userId},
		});

		if (existingFavorite) {
			existingFavorite.isFavorite = isFavorite === undefined ? !existingFavorite.isFavorite : isFavorite;
			await this.favoriteRepository.getEntityManager().persistAndFlush(existingFavorite);
		} else {
			const favorite = this.favoriteRepository.create({
				item,
				user: item.user,
				isFavorite: isFavorite === undefined ? true : isFavorite,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			await this.favoriteRepository.getEntityManager().persistAndFlush(favorite);
		}

		return true;
	}

	async rateItem(id: string, userId: string, rating: number): Promise<boolean> {
		const item = await this.asmrGenerationRepository.findOne({
			id,
			user: {id: userId},
		});

		if (!item) {
			return false;
		}

		const existingRating = await this.ratingRepository.findOne({
			item: {id},
			user: {id: userId},
		});

		if (existingRating) {
			existingRating.rating = rating;
			await this.ratingRepository.getEntityManager().persistAndFlush(existingRating);
		} else {
			const ratingEntity = this.ratingRepository.create({
				item,
				user: item.user,
				rating,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			await this.ratingRepository.getEntityManager().persistAndFlush(ratingEntity);
		}

		// Update average rating on the item
		await this.asmrGenerationRepository.getEntityManager().persistAndFlush(item);
		return true;
	}

	async getRecentItems(userId: string, limit = 10): Promise<ASMRLibraryItem[]> {
		const items = await this.asmrGenerationRepository.find(
			{
				user: {id: userId},
			},
			{
				orderBy: {createdAt: 'DESC'},
				limit,
				populate: ['user'],
			},
		);

		return Promise.all(items.map(async (item) => this.mapToLibraryItem(item, userId)));
	}

	async getFavoriteItems(
		userId: string,
		filters: Omit<LibraryFilterDto, 'status'>,
	): Promise<{
		items: ASMRLibraryItem[];
		total: number;
	}> {
		const {limit = 20, offset = 0} = filters;

		const favorites = await this.favoriteRepository.find(
			{
				user: {id: userId},
				isFavorite: true,
			},
			{
				populate: ['item', 'item.user'],
				limit,
				offset,
			},
		);

		const items = await Promise.all(favorites.map(async (fav) => this.mapToLibraryItem(fav.item, userId)));

		const total = await this.favoriteRepository.count({
			user: {id: userId},
			isFavorite: true,
		});

		return {items, total};
	}

	async getCategories(userId: string): Promise<Array<{category: string; count: number}>> {
		// Mock implementation - in a real scenario, you'd have categories in your data
		const items = await this.asmrGenerationRepository.find({
			user: {id: userId},
		});

		const categories = new Map<string, number>();
		for (const item of items) {
			// Extract category from tags or use a default categorization
			const category = item.tags?.[0] || 'uncategorized';
			categories.set(category, (categories.get(category) || 0) + 1);
		}

		return [...categories.entries()].map(([category, count]) => ({
			category,
			count,
		}));
	}

	async getPopularTags(userId: string, limit = 20): Promise<Array<{tag: string; count: number}>> {
		const items = await this.asmrGenerationRepository.find({
			user: {id: userId},
		});

		const tagCount = new Map<string, number>();
		for (const item of items) {
			if (item.tags) {
				for (const tag of item.tags) {
					tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
				}
			}
		}

		return [...tagCount.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, limit)
			.map(([tag, count]) => ({tag, count}));
	}

	async incrementPlayCount(id: string, userId: string): Promise<boolean> {
		const item = await this.asmrGenerationRepository.findOne({
			id,
			user: {id: userId},
		});

		if (!item) {
			return false;
		}

		item.playCount = (item.playCount || 0) + 1;
		await this.asmrGenerationRepository.getEntityManager().persistAndFlush(item);
		return true;
	}

	async findSimilarItems(id: string, userId: string, limit = 5): Promise<ASMRLibraryItem[]> {
		const targetItem = await this.asmrGenerationRepository.findOne({
			id,
			user: {id: userId},
		});

		if (!targetItem) {
			return [];
		}

		// Find similar items based on tags
		const similarItems = await this.asmrGenerationRepository.find(
			{
				user: {id: userId},
				id: {$ne: id},
				tags: {$in: targetItem.tags || []},
			},
			{
				limit,
				populate: ['user'],
			},
		);

		return Promise.all(similarItems.map(async (item) => this.mapToLibraryItem(item, userId)));
	}

	async bulkAction(userId: string, bulkActionDto: BulkActionDto): Promise<void> {
		const {itemIds, action, data} = bulkActionDto;

		const items = await this.asmrGenerationRepository.find({
			id: {$in: itemIds},
			user: {id: userId},
		});

		switch (action) {
			case 'delete': {
				for (const item of items) {
					await this.deleteLibraryItem(item.id, userId);
				}

				break;
			}

			case 'favorite': {
				for (const item of items) {
					await this.toggleFavorite(item.id, userId, true);
				}

				break;
			}

			case 'unfavorite': {
				for (const item of items) {
					await this.toggleFavorite(item.id, userId, false);
				}

				break;
			}

			case 'update-tags': {
				if (data?.tags) {
					for (const item of items) {
						item.tags = data.tags;
					}

					await this.asmrGenerationRepository.getEntityManager().persistAndFlush(items);
				}

				break;
			}
		}
	}

	async exportLibrary(
		userId: string,
		format: 'json' | 'csv' | 'xml',
	): Promise<{
		data: any;
		filename: string;
		contentType: string;
	}> {
		const items = await this.asmrGenerationRepository.find(
			{
				user: {id: userId},
			},
			{
				populate: ['user'],
			},
		);

		const libraryItems = await Promise.all(items.map(async (item) => this.mapToLibraryItem(item, userId)));

		const timestamp = new Date().toISOString().slice(0, 10);

		switch (format) {
			case 'json': {
				return {
					data: libraryItems,
					filename: `asmr-library-${timestamp}.json`,
					contentType: 'application/json',
				};
			}

			case 'csv': {
				const csvData = this.convertToCSV(libraryItems);
				return {
					data: csvData,
					filename: `asmr-library-${timestamp}.csv`,
					contentType: 'text/csv',
				};
			}

			case 'xml': {
				const xmlData = this.convertToXML(libraryItems);
				return {
					data: xmlData,
					filename: `asmr-library-${timestamp}.xml`,
					contentType: 'application/xml',
				};
			}

			default: {
				throw new Error('Unsupported format');
			}
		}
	}

	private convertToCSV(items: ASMRLibraryItem[]): string {
		const header = 'id,title,description,duration,fileSize,tags,rating,playCount,createdAt,isPrivate,isFavorite\n';
		const rows = items
			.map(
				(item) =>
					`${item.id},"${item.title}","${item.description}",${item.duration},${item.fileSize},"${item.tags.join(';')}",${item.rating || ''},${item.playCount},${item.createdAt.toISOString()},${item.isPrivate},${item.isFavorite}`,
			)
			.join('\n');
		return header + rows;
	}

	private convertToXML(items: ASMRLibraryItem[]): string {
		const xmlItems = items
			.map(
				(item) => `
      <item>
        <id>${item.id}</id>
        <title><![CDATA[${item.title}]]></title>
        <description><![CDATA[${item.description}]]></description>
        <duration>${item.duration}</duration>
        <fileSize>${item.fileSize}</fileSize>
        <tags>${item.tags.join(';')}</tags>
        <rating>${item.rating || ''}</rating>
        <playCount>${item.playCount}</playCount>
        <createdAt>${item.createdAt.toISOString()}</createdAt>
        <isPrivate>${item.isPrivate}</isPrivate>
        <isFavorite>${item.isFavorite}</isFavorite>
      </item>
    `,
			)
			.join('');

		return `<?xml version="1.0" encoding="UTF-8"?>
    <library>
      ${xmlItems}
    </library>`;
	}

	private async mapToLibraryItem(generation: ASMRGeneration, userId: string): Promise<ASMRLibraryItem> {
		// Get favorite status
		const favorite = await this.favoriteRepository.findOne({
			item: {id: generation.id},
			user: {id: userId},
		});

		// Get user rating
		const userRating = await this.ratingRepository.findOne({
			item: {id: generation.id},
			user: {id: userId},
		});

		return {
			id: generation.id,
			title: generation.title,
			description: generation.description || '',
			fileUrl: generation.filePath || '',
			thumbnailUrl: undefined,
			duration: generation.duration || 0,
			fileSize: generation.fileSize || 0,
			tags: generation.tags || [],
			generationSettings: {
				voice: generation.voiceSettings,
				soundscape: generation.soundscapeSettings,
				mixing: generation.mixingSettings,
			},
			playCount: generation.playCount || 0,
			rating: userRating?.rating,
			createdAt: generation.createdAt,
			updatedAt: generation.updatedAt,
			isPrivate: generation.isPrivate,
			isFavorite: favorite?.isFavorite || false,
			status: generation.status,
		};
	}
}
