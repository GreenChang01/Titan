import {Injectable, Logger, BadRequestException, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository, EntityManager} from '@mikro-orm/core';
import {AIPrompt} from '../entities/prompt.entity';
import {PromptTag} from '../entities/prompt-tag.entity';
import {PromptCategory} from '../../common/enums/prompt-category.enum';

/**
 * AI提示词服务
 * 管理AI提示词的创建、查询、更新和删除
 */
@Injectable()
export class AIPromptService {
	private readonly logger = new Logger(AIPromptService.name);

	constructor(
		@InjectRepository(AIPrompt)
		private readonly promptRepository: EntityRepository<AIPrompt>,
		@InjectRepository(PromptTag)
		private readonly tagRepository: EntityRepository<PromptTag>,
		private readonly em: EntityManager,
	) {}

	/**
	 * 创建AI提示词
	 * @param data 提示词数据
	 * @returns 创建的提示词
	 */
	async createPrompt(data: {
		userId: string;
		title: string;
		content: string;
		category?: PromptCategory;
		isPublic?: boolean;
		isAiGenerated?: boolean;
		generationParams?: Record<string, any>;
		tags?: string[];
	}): Promise<AIPrompt> {
		try {
			// 验证数据
			if (!data.title?.trim()) {
				throw new BadRequestException('提示词标题不能为空');
			}

			if (!data.content?.trim()) {
				throw new BadRequestException('提示词内容不能为空');
			}

			if (data.title.length > 255) {
				throw new BadRequestException('提示词标题长度不能超过255个字符');
			}

			if (data.content.length > 5000) {
				throw new BadRequestException('提示词内容长度不能超过5000个字符');
			}

			// 创建提示词实体
			const prompt = new AIPrompt({
				userId: data.userId,
				title: data.title.trim(),
				content: data.content.trim(),
				category: data.category,
				isPublic: data.isPublic ?? false,
				isAiGenerated: data.isAiGenerated ?? false,
				generationParams: data.generationParams,
			});

			// 持久化到数据库
			await this.em.persistAndFlush(prompt);

			// 处理标签
			if (data.tags?.length) {
				await this.addTagsToPrompt(prompt, data.tags);
			}

			this.logger.log(`AI提示词创建成功: ${prompt.id} for user: ${data.userId}`);

			return prompt;
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`创建AI提示词失败: ${error.message}`, error.stack);
			} else {
				this.logger.error('创建AI提示词失败: Unknown error', error);
			}

			throw error;
		}
	}

	/**
	 * 获取用户的提示词列表
	 * @param userId 用户ID
	 * @param options 查询选项
	 * @returns 提示词列表
	 */
	async getUserPrompts(
		userId: string,
		options: {
			category?: PromptCategory;
			isPublic?: boolean;
			limit?: number;
			offset?: number;
			search?: string;
		} = {},
	): Promise<{items: AIPrompt[]; total: number}> {
		try {
			const where: any = {userId};

			// 添加过滤条件
			if (options.category) {
				where.category = options.category;
			}

			if (options.isPublic !== undefined) {
				where.isPublic = options.isPublic;
			}

			if (options.search) {
				where.$or = [
					{title: {$ilike: `%${options.search}%`}},
					{content: {$ilike: `%${options.search}%`}},
				];
			}

			const [items, total] = await this.promptRepository.findAndCount(where, {
				populate: ['tags'],
				orderBy: {createdAt: 'DESC'},
				limit: options.limit || 20,
				offset: options.offset || 0,
			});

			return {items, total};
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`获取用户提示词失败: ${error.message}`, error.stack);
			} else {
				this.logger.error('获取用户提示词失败: Unknown error', error);
			}

			throw error;
		}
	}

	/**
	 * 获取公开的提示词列表
	 * @param options 查询选项
	 * @returns 公开提示词列表
	 */
	async getPublicPrompts(options: {
		category?: PromptCategory;
		limit?: number;
		offset?: number;
		search?: string;
		sortBy?: 'createdAt' | 'usageCount' | 'rating';
		sortOrder?: 'ASC' | 'DESC';
	} = {}): Promise<{items: AIPrompt[]; total: number}> {
		try {
			const where: any = {isPublic: true};

			// 添加过滤条件
			if (options.category) {
				where.category = options.category;
			}

			if (options.search) {
				where.$or = [
					{title: {$ilike: `%${options.search}%`}},
					{content: {$ilike: `%${options.search}%`}},
				];
			}

			// 设置排序
			const sortBy = options.sortBy || 'createdAt';
			const sortOrder = options.sortOrder || 'DESC';

			const [items, total] = await this.promptRepository.findAndCount(where, {
				populate: ['tags'],
				orderBy: {[sortBy]: sortOrder},
				limit: options.limit || 20,
				offset: options.offset || 0,
			});

			return {items, total};
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`获取公开提示词失败: ${error.message}`, error.stack);
			} else {
				this.logger.error('获取公开提示词失败: Unknown error', error);
			}

			throw error;
		}
	}

	/**
	 * 根据ID获取提示词
	 * @param id 提示词ID
	 * @param userId 用户ID(用于权限验证)
	 * @returns 提示词信息
	 */
	async getPromptById(id: string, userId?: string): Promise<AIPrompt> {
		try {
			const where: any = {id};

			// 如果提供了用户ID，则限制只能访问自己的或公开的提示词
			if (userId) {
				where.$or = [
					{userId},
					{isPublic: true},
				];
			}

			const prompt = await this.promptRepository.findOne(where, {
				populate: ['tags'],
			});

			if (!prompt) {
				throw new NotFoundException('提示词不存在或无访问权限');
			}

			return prompt;
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`获取提示词失败: ${error.message}`, error.stack);
			} else {
				this.logger.error('获取提示词失败: Unknown error', error);
			}

			throw error;
		}
	}

	/**
	 * 更新提示词
	 * @param id 提示词ID
	 * @param userId 用户ID
	 * @param data 更新数据
	 * @returns 更新后的提示词
	 */
	async updatePrompt(
		id: string,
		userId: string,
		data: {
			title?: string;
			content?: string;
			category?: PromptCategory;
			isPublic?: boolean;
			tags?: string[];
		},
	): Promise<AIPrompt> {
		try {
			const prompt = await this.promptRepository.findOne({
				id,
				userId,
			});

			if (!prompt) {
				throw new NotFoundException('提示词不存在或无修改权限');
			}

			// 更新字段
			if (data.title !== undefined) {
				if (!data.title.trim()) {
					throw new BadRequestException('提示词标题不能为空');
				}

				if (data.title.length > 255) {
					throw new BadRequestException('提示词标题长度不能超过255个字符');
				}

				prompt.title = data.title.trim();
			}

			if (data.content !== undefined) {
				if (!data.content.trim()) {
					throw new BadRequestException('提示词内容不能为空');
				}

				if (data.content.length > 5000) {
					throw new BadRequestException('提示词内容长度不能超过5000个字符');
				}

				prompt.content = data.content.trim();
			}

			if (data.category !== undefined) {
				prompt.category = data.category;
			}

			if (data.isPublic !== undefined) {
				prompt.isPublic = data.isPublic;
			}

			// 更新标签
			if (data.tags !== undefined) {
				// 清除现有标签
				prompt.tags.removeAll();

				// 添加新标签
				if (data.tags.length > 0) {
					await this.addTagsToPrompt(prompt, data.tags);
				}
			}

			await this.em.persistAndFlush(prompt);

			this.logger.log(`AI提示词更新成功: ${id} by user: ${userId}`);

			return prompt;
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`更新AI提示词失败: ${error.message}`, error.stack);
			} else {
				this.logger.error('更新AI提示词失败: Unknown error', error);
			}

			throw error;
		}
	}

	/**
	 * 删除提示词
	 * @param id 提示词ID
	 * @param userId 用户ID
	 * @returns 是否删除成功
	 */
	async deletePrompt(id: string, userId: string): Promise<boolean> {
		try {
			const prompt = await this.promptRepository.findOne({
				id,
				userId,
			});

			if (!prompt) {
				return false;
			}

			await this.em.removeAndFlush(prompt);

			this.logger.log(`AI提示词删除成功: ${id} by user: ${userId}`);
			return true;
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`删除AI提示词失败: ${error.message}`, error.stack);
			} else {
				this.logger.error('删除AI提示词失败: Unknown error', error);
			}

			throw error;
		}
	}

	/**
	 * 增加提示词使用次数
	 * @param id 提示词ID
	 * @returns 更新后的提示词
	 */
	async incrementUsageCount(id: string): Promise<AIPrompt> {
		try {
			const prompt = await this.promptRepository.findOne({id});

			if (!prompt) {
				throw new NotFoundException('提示词不存在');
			}

			prompt.usageCount += 1;
			await this.em.persistAndFlush(prompt);

			return prompt;
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`增加使用次数失败: ${error.message}`, error.stack);
			} else {
				this.logger.error('增加使用次数失败: Unknown error', error);
			}

			throw error;
		}
	}

	/**
	 * 为提示词添加标签
	 * @param prompt 提示词实体
	 * @param tagNames 标签名称数组
	 */
	private async addTagsToPrompt(prompt: AIPrompt, tagNames: string[]): Promise<void> {
		for (const tagName of tagNames) {
			if (!tagName.trim()) {
				continue;
			}

			// 查找或创建标签
			let tag = await this.tagRepository.findOne({name: tagName.trim()});

			if (!tag) {
				tag = new PromptTag({
					name: tagName.trim(),
					category: prompt.category,
				});
				await this.em.persistAndFlush(tag);
			}

			// 添加标签到提示词
			if (!prompt.tags.contains(tag)) {
				prompt.tags.add(tag);
				tag.usageCount += 1;
			}
		}
	}

	/**
	 * 获取热门标签
	 * @param limit 限制数量
	 * @returns 热门标签列表
	 */
	async getPopularTags(limit = 20): Promise<PromptTag[]> {
		try {
			return await this.tagRepository.find(
				{},
				{
					orderBy: {usageCount: 'DESC'},
					limit,
				},
			);
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`获取热门标签失败: ${error.message}`, error.stack);
			} else {
				this.logger.error('获取热门标签失败: Unknown error', error);
			}

			return [];
		}
	}

	/**
	 * 按分类获取提示词统计
	 * @param userId 用户ID(可选)
	 * @returns 分类统计信息
	 */
	async getPromptStatsByCategory(userId?: string): Promise<Array<{category: PromptCategory; count: number}>> {
		try {
			const where = userId ? {userId} : {};

			const result = await this.promptRepository
				.getEntityManager()
				.getConnection()
				.execute(
					`
					SELECT category, COUNT(*) as count
					FROM ai_prompt
					${userId ? 'WHERE user_id = ?' : ''}
					GROUP BY category
					ORDER BY count DESC
				`,
					userId ? [userId] : [],
				);

			return result.map((row: any) => ({
				category: row.category as PromptCategory,
				count: Number.parseInt(row.count, 10),
			}));
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`获取分类统计失败: ${error.message}`, error.stack);
			} else {
				this.logger.error('获取分类统计失败: Unknown error', error);
			}

			return [];
		}
	}
}
