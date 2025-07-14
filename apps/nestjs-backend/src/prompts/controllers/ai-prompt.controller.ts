import {
	Controller,
	Post,
	Get,
	Put,
	Delete,
	Body,
	Param,
	Query,
	ParseUUIDPipe,
	UseGuards,
	Request,
	BadRequestException,
	ParseIntPipe,
	DefaultValuePipe,
} from '@nestjs/common';
import {JwtAuthGuard} from '../../auth/jwt-auth.guard';
import {AIPromptService} from '../services/ai-prompt.service';
import {AIPrompt} from '../entities/prompt.entity';
import {PromptTag} from '../entities/prompt-tag.entity';
import {PromptCategory} from '../../common/enums/prompt-category.enum';

/**
 * 创建AI提示词DTO
 */
export class CreatePromptDto {
	/** 提示词标题 */
	title: string;

	/** 提示词内容 */
	content: string;

	/** 提示词分类 */
	category?: PromptCategory;

	/** 是否公开 */
	isPublic?: boolean;

	/** 是否AI生成 */
	isAiGenerated?: boolean;

	/** 生成参数 */
	generationParams?: Record<string, any>;

	/** 标签列表 */
	tags?: string[];
}

/**
 * 更新AI提示词DTO
 */
export class UpdatePromptDto {
	/** 提示词标题 */
	title?: string;

	/** 提示词内容 */
	content?: string;

	/** 提示词分类 */
	category?: PromptCategory;

	/** 是否公开 */
	isPublic?: boolean;

	/** 标签列表 */
	tags?: string[];
}

/**
 * 查询提示词DTO
 */
export class QueryPromptsDto {
	/** 分类过滤 */
	category?: PromptCategory;

	/** 是否公开 */
	isPublic?: boolean;

	/** 页面大小 */
	limit?: number;

	/** 偏移量 */
	offset?: number;

	/** 搜索关键词 */
	search?: string;

	/** 排序字段 */
	sortBy?: 'createdAt' | 'usageCount' | 'rating';

	/** 排序方向 */
	sortOrder?: 'ASC' | 'DESC';
}

/**
 * AI提示词管理控制器
 * 提供AI提示词管理相关的RESTful API
 */
@Controller('prompts')
@UseGuards(JwtAuthGuard)
export class AIPromptController {
	constructor(private readonly promptService: AIPromptService) {}

	/**
	 * 创建AI提示词
	 * @param createDto 创建参数
	 * @param req 请求对象
	 * @returns 创建的提示词
	 */
	@Post()
	async createPrompt(
		@Body() createDto: CreatePromptDto,
		@Request() req: any,
	): Promise<AIPrompt> {
		const userId = req.user.id;

		// 验证必需字段
		if (!createDto.title?.trim()) {
			throw new BadRequestException('提示词标题不能为空');
		}

		if (!createDto.content?.trim()) {
			throw new BadRequestException('提示词内容不能为空');
		}

		// 验证标签数量
		if (createDto.tags && createDto.tags.length > 20) {
			throw new BadRequestException('标签数量不能超过20个');
		}

		return this.promptService.createPrompt({
			userId,
			title: createDto.title,
			content: createDto.content,
			category: createDto.category,
			isPublic: createDto.isPublic,
			isAiGenerated: createDto.isAiGenerated,
			generationParams: createDto.generationParams,
			tags: createDto.tags,
		});
	}

	/**
	 * 获取用户的提示词列表
	 * @param query 查询参数
	 * @param req 请求对象
	 * @returns 提示词列表
	 */
	@Get('my')
	async getMyPrompts(
		@Query() query: QueryPromptsDto,
		@Request() req: any,
	): Promise<{items: AIPrompt[]; total: number}> {
		const userId = req.user.id;
		const limit = query.limit || 20;
		const offset = query.offset || 0;

		// 验证分页参数
		if (limit > 100) {
			throw new BadRequestException('每页最多返回100条记录');
		}

		if (offset < 0) {
			throw new BadRequestException('偏移量不能为负数');
		}

		return this.promptService.getUserPrompts(userId, {
			category: query.category,
			isPublic: query.isPublic,
			limit,
			offset,
			search: query.search,
		});
	}

	/**
	 * 获取公开的提示词列表
	 * @param query 查询参数
	 * @returns 公开提示词列表
	 */
	@Get('public')
	async getPublicPrompts(
		@Query() query: QueryPromptsDto,
	): Promise<{items: AIPrompt[]; total: number}> {
		const limit = query.limit || 20;
		const offset = query.offset || 0;

		// 验证分页参数
		if (limit > 100) {
			throw new BadRequestException('每页最多返回100条记录');
		}

		if (offset < 0) {
			throw new BadRequestException('偏移量不能为负数');
		}

		return this.promptService.getPublicPrompts({
			category: query.category,
			limit,
			offset,
			search: query.search,
			sortBy: query.sortBy,
			sortOrder: query.sortOrder,
		});
	}

	/**
	 * 根据ID获取提示词
	 * @param id 提示词ID
	 * @param req 请求对象
	 * @returns 提示词信息
	 */
	@Get(':id')
	async getPromptById(
		@Param('id', ParseUUIDPipe) id: string,
		@Request() req: any,
	): Promise<AIPrompt> {
		const userId = req.user.id;
		return this.promptService.getPromptById(id, userId);
	}

	/**
	 * 更新提示词
	 * @param id 提示词ID
	 * @param updateDto 更新参数
	 * @param req 请求对象
	 * @returns 更新后的提示词
	 */
	@Put(':id')
	async updatePrompt(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() updateDto: UpdatePromptDto,
		@Request() req: any,
	): Promise<AIPrompt> {
		const userId = req.user.id;

		// 验证标签数量
		if (updateDto.tags && updateDto.tags.length > 20) {
			throw new BadRequestException('标签数量不能超过20个');
		}

		return this.promptService.updatePrompt(id, userId, updateDto);
	}

	/**
	 * 删除提示词
	 * @param id 提示词ID
	 * @param req 请求对象
	 * @returns 删除结果
	 */
	@Delete(':id')
	async deletePrompt(
		@Param('id', ParseUUIDPipe) id: string,
		@Request() req: any,
	): Promise<{success: boolean}> {
		const userId = req.user.id;
		const success = await this.promptService.deletePrompt(id, userId);

		if (!success) {
			throw new BadRequestException('提示词不存在或无删除权限');
		}

		return {success};
	}

	/**
	 * 增加提示词使用次数
	 * @param id 提示词ID
	 * @returns 更新后的提示词
	 */
	@Post(':id/increment-usage')
	async incrementUsage(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<AIPrompt> {
		return this.promptService.incrementUsageCount(id);
	}

	/**
	 * 获取热门标签
	 * @param limit 限制数量
	 * @returns 热门标签列表
	 */
	@Get('tags/popular')
	async getPopularTags(
		@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
	): Promise<PromptTag[]> {
		if (limit > 50) {
			throw new BadRequestException('最多返回50个热门标签');
		}

		return this.promptService.getPopularTags(limit);
	}

	/**
	 * 获取提示词分类统计
	 * @param req 请求对象
	 * @returns 分类统计信息
	 */
	@Get('stats/category')
	async getCategoryStats(
		@Request() req: any,
	): Promise<Array<{category: PromptCategory; count: number}>> {
		const userId = req.user.id;
		return this.promptService.getPromptStatsByCategory(userId);
	}

	/**
	 * 获取所有分类统计（管理员用）
	 * @returns 全局分类统计信息
	 */
	@Get('stats/global-category')
	async getGlobalCategoryStats(): Promise<Array<{category: PromptCategory; count: number}>> {
		return this.promptService.getPromptStatsByCategory();
	}
}
