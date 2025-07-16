import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { 
  ASMRLibraryItem, 
  GenerationStatus,
} from '../dto/asmr-generation.dto';
import { 
  LibraryFilterDto, 
  UpdateLibraryItemDto, 
  LibraryStatsDto,
  BulkActionDto,
} from '../dto/asmr-library.dto';
import { ASMRGeneration } from '../entities/asmr-generation.entity';
import { LibraryItemFavorite } from '../entities/library-item-favorite.entity';
import { LibraryItemRating } from '../entities/library-item-rating.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

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
    const { 
      search, 
      category, 
      status, 
      tags, 
      limit = 20, 
      offset = 0, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = filter;

    // Build filter criteria
    const where: any = { user: { id: userId } };
    
    if (status) {
      where.status = status;
    }

    // Get items with basic filtering
    const [items, total] = await this.asmrGenerationRepository.findAndCount(
      where,
      {
        limit,
        offset,
        orderBy: { [sortBy]: sortOrder },
        populate: ['user'],
      },
    );

    const libraryItems = await Promise.all(
      items.map(item => this.mapToLibraryItem(item, userId))
    );

    return {
      items: libraryItems,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLibraryItem(id: string, userId: string): Promise<ASMRLibraryItem | null> {
    const item = await this.asmrGenerationRepository.findOne({
      id,
      user: { id: userId },
    }, { populate: ['user'] });
    
    if (!item) {
      return null;
    }
    
    return this.mapToLibraryItem(item, userId);
  }

  async getLibraryStats(userId: string): Promise<LibraryStatsDto> {
    // Basic counts
    const totalItems = await this.asmrGenerationRepository.count({
      user: { id: userId },
    });
    const completedItems = await this.asmrGenerationRepository.count({
      user: { id: userId },
      status: GenerationStatus.COMPLETED,
    });
    const processingItems = await this.asmrGenerationRepository.count({
      user: { id: userId },
      status: GenerationStatus.PROCESSING,
    });
    const failedItems = await this.asmrGenerationRepository.count({
      user: { id: userId },
      status: GenerationStatus.FAILED,
    });
    
    // Favorites count
    const favoriteItems = await this.favoriteRepository.count({
      user: { id: userId },
      isFavorite: true,
    });
    
    // Get completed items for aggregates
    const completedGenerations = await this.asmrGenerationRepository.find({
      user: { id: userId },
      status: GenerationStatus.COMPLETED,
    });
    
    const totalDuration = completedGenerations.reduce((sum, gen) => sum + (gen.duration || 0), 0);
    const totalFileSize = completedGenerations.reduce((sum, gen) => sum + (gen.fileSize || 0), 0);
    const totalPlayCount = completedGenerations.reduce((sum, gen) => sum + (gen.playCount || 0), 0);
    
    // Get ratings for average
    const ratings = await this.ratingRepository.find({
      user: { id: userId },
    });
    const averageRating = ratings.length > 0 ? 
      ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

    // Mock popular tags for now
    const popularTags = [
      { tag: 'gentle', count: 10 },
      { tag: 'sleep', count: 8 },
      { tag: 'relaxing', count: 6 },
    ];
    
    // Get recent generations for activity
    const recentGenerations = await this.asmrGenerationRepository.find({
      user: { id: userId },
    }, {
      orderBy: { createdAt: 'DESC' },
      limit: 10,
    });
    
    const recentActivity = recentGenerations.map(gen => ({
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
        today: recentGenerations.filter(g => 
          g.createdAt.toDateString() === new Date().toDateString()).length,
        thisWeek: recentGenerations.length,
        thisMonth: recentGenerations.length,
        thisYear: recentGenerations.length,
      },
      usageStats: {
        totalGenerations: totalItems,
        totalCost: completedGenerations.reduce((sum, gen) => sum + (gen.cost || 0), 0),
        averageCostPerItem: totalItems > 0 ? 
          completedGenerations.reduce((sum, gen) => sum + (gen.cost || 0), 0) / totalItems : 0,
        averageDuration: completedItems > 0 ? totalDuration / completedItems : 0,
        mostUsedVoiceType: 'gentle_female',
        mostUsedSoundscapeType: 'nature',
      },
      recentActivity,
    };
  }

  async updateLibraryItem(
    id: string,
    userId: string,
    updates: UpdateLibraryItemDto,
  ): Promise<ASMRLibraryItem> {
    const item = await this.asmrGenerationRepository.findOne({
      id,
      user: { id: userId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    // Apply updates
    if (updates.title) item.title = updates.title;
    if (updates.description !== undefined) item.description = updates.description;
    if (updates.tags) item.tags = updates.tags;
    if (updates.isPrivate !== undefined) item.isPrivate = updates.isPrivate;

    await this.asmrGenerationRepository.getEntityManager().persistAndFlush(item);
    return this.mapToLibraryItem(item, userId);
  }

  async deleteLibraryItem(id: string, userId: string): Promise<void> {
    const item = await this.asmrGenerationRepository.findOne({
      id,
      user: { id: userId },
    });

    if (!item) {
      throw new Error('Item not found');
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
  }

  async toggleFavorite(id: string, userId: string): Promise<void> {
    const item = await this.asmrGenerationRepository.findOne({
      id,
      user: { id: userId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    const existingFavorite = await this.favoriteRepository.findOne({
      item: { id },
      user: { id: userId },
    });

    if (existingFavorite) {
      existingFavorite.isFavorite = !existingFavorite.isFavorite;
      await this.favoriteRepository.getEntityManager().persistAndFlush(existingFavorite);
    } else {
      const favorite = this.favoriteRepository.create({
        item: item,
        user: { id: userId },
        isFavorite: true,
      });
      await this.favoriteRepository.getEntityManager().persistAndFlush(favorite);
    }
  }

  async rateLibraryItem(
    id: string,
    userId: string,
    rating: number,
  ): Promise<void> {
    const item = await this.asmrGenerationRepository.findOne({
      id,
      user: { id: userId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    const existingRating = await this.ratingRepository.findOne({
      item: { id },
      user: { id: userId },
    });

    if (existingRating) {
      existingRating.rating = rating;
      await this.ratingRepository.getEntityManager().persistAndFlush(existingRating);
    } else {
      const ratingEntity = this.ratingRepository.create({
        item: item,
        user: { id: userId },
        rating,
      });
      await this.ratingRepository.getEntityManager().persistAndFlush(ratingEntity);
    }

    // Update average rating on the item
    await this.asmrGenerationRepository.getEntityManager().persistAndFlush(item);
  }

  private async mapToLibraryItem(generation: ASMRGeneration, userId: string): Promise<ASMRLibraryItem> {
    // Get favorite status
    const favorite = await this.favoriteRepository.findOne({
      item: { id: generation.id },
      user: { id: userId },
    });

    // Get user rating
    const userRating = await this.ratingRepository.findOne({
      item: { id: generation.id },
      user: { id: userId },
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