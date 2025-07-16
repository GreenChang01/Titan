import {Injectable, Logger, BadRequestException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository, EntityManager} from '@mikro-orm/core';
import {AIGeneratedImage} from '../entities/ai-generated-image.entity';
import {Asset} from '../../asset/entities/asset.entity';
import {AssetType} from '../../common/enums/asset-type.enum';
import {UploadSource} from '../../common/enums/content.enum';

/**
 * AI图片生成服务
 * 使用Pollinations.AI生成图片并管理相关元数据
 */
@Injectable()
export class AIImageGenerationService {
	private readonly logger = new Logger(AIImageGenerationService.name);
	private readonly pollinationsBaseUrl = 'https://image.pollinations.ai/prompt';

	constructor(
		private readonly configService: ConfigService,
		@InjectRepository(AIGeneratedImage)
		private readonly aiImageRepository: EntityRepository<AIGeneratedImage>,
		@InjectRepository(Asset)
		private readonly assetRepository: EntityRepository<Asset>,
		private readonly em: EntityManager,
	) {}

	/**
	 * 生成AI图片
	 * @param prompt 生成提示词
	 * @param options 生成选项
	 * @param userId 用户ID
	 * @returns 生成的图片信息
	 */
	async generateImage(
		prompt: string,
		userId: string,
		options: {
			width?: number;
			height?: number;
			seed?: number;
			nologo?: boolean;
			model?: string;
		} = {},
	): Promise<AIGeneratedImage> {
		// 验证参数
		if (!prompt?.trim()) {
			throw new BadRequestException('提示词不能为空');
		}

		if (prompt.length > 2000) {
			throw new BadRequestException('提示词长度不能超过2000个字符');
		}

		try {
			// 设置默认参数
			const defaultOptions = {
				width: 1024,
				height: 1024,
				seed: Math.floor(Math.random() * 10_000),
				nologo: true,
				model: 'turbo',
				...options,
			};

			// 构建Pollinations.AI URL
			const generationUrl = this.buildPollinationsUrl(prompt, defaultOptions);

			this.logger.debug(`生成AI图片URL: ${generationUrl}`);

			// 验证URL是否可访问 (实际项目中可以添加HTTP请求验证)
			const isUrlValid = await this.validateImageUrl(generationUrl);
			if (!isUrlValid) {
				throw new BadRequestException('图片生成失败，请稍后重试');
			}

			// 创建Asset记录
			const asset = new Asset({
				userId,
				fileName: `AI生成图片_${prompt.slice(0, 50)}`,
				originalName: `AI生成图片_${prompt.slice(0, 50)}`,
				filePath: generationUrl,
				fileSize: 0, // AI生成的资源没有本地文件大小
				mimeType: 'image/png',
				assetType: AssetType.AI_GENERATED_IMAGE,
				uploadSource: UploadSource.AI_GENERATED,
			});

			// 设置可选属性
			asset.metadata = {
				prompt,
				...defaultOptions,
				generatedAt: new Date(),
			};

			// 设置URL而不是本地路径
			asset.url = generationUrl;

			await this.em.persistAndFlush(asset);

			// 创建AIGeneratedImage记录
			const aiImage = new AIGeneratedImage({
				asset,
				prompt,
				seed: defaultOptions.seed,
				generationUrl,
				pollinationsParams: defaultOptions,
			});

			await this.em.persistAndFlush(aiImage);

			this.logger.log(`AI图片生成成功: ${aiImage.id} for user: ${userId}`);

			return aiImage;
		} catch (error: any) {
			this.logger.error(`AI图片生成失败: ${error.message}`, error.stack);
			throw error;
		}
	}

	/**
	 * 构建Pollinations.AI生成URL
	 * @param prompt 提示词
	 * @param options 生成选项
	 * @returns 完整的生成URL
	 */
	private buildPollinationsUrl(
		prompt: string,
		options: {
			width?: number;
			height?: number;
			seed?: number;
			nologo?: boolean;
			model?: string;
		},
	): string {
		// URL编码提示词
		const encodedPrompt = encodeURIComponent(prompt);

		// 构建查询参数
		const params = new URLSearchParams();

		if (options.width) {
			params.append('width', options.width.toString());
		}

		if (options.height) {
			params.append('height', options.height.toString());
		}

		if (options.seed) {
			params.append('seed', options.seed.toString());
		}

		if (options.nologo) {
			params.append('nologo', 'true');
		}

		if (options.model) {
			params.append('model', options.model);
		}

		// 构建完整URL
		const baseUrl = `${this.pollinationsBaseUrl}/${encodedPrompt}`;
		const queryString = params.toString();

		return queryString ? `${baseUrl}?${queryString}` : baseUrl;
	}

	/**
	 * 验证图片URL是否有效
	 * @param url 图片URL
	 * @returns 是否有效
	 */
	private async validateImageUrl(url: string): Promise<boolean> {
		try {
			// 在生产环境中，这里应该发送HTTP HEAD请求来验证URL
			// 目前仅进行基本URL格式验证
			const urlPattern = /^https?:\/\/.+/;
			return urlPattern.test(url);
		} catch (error: any) {
			this.logger.warn(`图片URL验证失败: ${url}`, error.message);
			return false;
		}
	}

	/**
	 * 获取用户的AI生成图片历史
	 * @param userId 用户ID
	 * @param limit 限制数量
	 * @param offset 偏移量
	 * @returns 生成历史列表
	 */
	async getUserGenerationHistory(
		userId: string,
		limit = 20,
		offset = 0,
	): Promise<{items: AIGeneratedImage[]; total: number}> {
		try {
			const [items, total] = await this.aiImageRepository.findAndCount(
				{
					asset: {userId},
				},
				{
					populate: ['asset'],
					orderBy: {generatedAt: 'DESC'},
					limit,
					offset,
				},
			);

			return {items, total};
		} catch (error: any) {
			this.logger.error(`获取用户生成历史失败: ${error.message}`, error.stack);
			throw error;
		}
	}

	/**
	 * 根据ID获取AI生成图片
	 * @param id 图片ID
	 * @param userId 用户ID(用于权限验证)
	 * @returns AI生成图片信息
	 */
	async getAIImageById(id: string, userId: string): Promise<AIGeneratedImage | null> {
		try {
			return await this.aiImageRepository.findOne(
				{
					id,
					asset: {userId},
				},
				{
					populate: ['asset'],
				},
			);
		} catch (error: any) {
			this.logger.error(`获取AI图片失败: ${error.message}`, error.stack);
			throw error;
		}
	}

	/**
	 * 删除AI生成图片
	 * @param id 图片ID
	 * @param userId 用户ID
	 * @returns 是否删除成功
	 */
	async deleteAIImage(id: string, userId: string): Promise<boolean> {
		try {
			const aiImage = await this.getAIImageById(id, userId);

			if (!aiImage) {
				return false;
			}

			// 删除相关记录
			await this.em.removeAndFlush([aiImage, aiImage.asset]);

			this.logger.log(`AI图片删除成功: ${id} by user: ${userId}`);
			return true;
		} catch (error: any) {
			this.logger.error(`删除AI图片失败: ${error.message}`, error.stack);
			throw error;
		}
	}

	/**
	 * 获取热门生成提示词
	 * @param limit 限制数量
	 * @returns 热门提示词列表
	 */
	async getPopularPrompts(limit = 10): Promise<Array<{prompt: string; count: number}>> {
		try {
			// 使用原生SQL查询获取使用最多的提示词
			const result = await this.aiImageRepository
				.getEntityManager()
				.getConnection()
				.execute(
					`
					SELECT prompt, COUNT(*) as count
					FROM ai_generated_image 
					GROUP BY prompt 
					ORDER BY count DESC, generated_at DESC 
					LIMIT ?
				`,
					[limit],
				);

			return result.map((row: any) => ({
				prompt: row.prompt,
				count: Number.parseInt(row.count, 10),
			}));
		} catch (error: any) {
			this.logger.error(`获取热门提示词失败: ${error.message}`, error.stack);
			return [];
		}
	}
}
