import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {EntityManager} from '@mikro-orm/postgresql';
import {Asset} from '../../asset/entities/asset.entity';
import {AssetType, UploadSource} from '../../common/enums';
import {v4 as uuidv4} from 'uuid';
import {GenerateImageDto} from '../dto/generate-image.dto';

export type AIImageGenerationResult = {
	id: string;
	imageUrl: string;
	prompt: string;
	seed: number;
	asset?: Asset;
	status: 'pending' | 'completed' | 'failed';
	error?: string;
};

@Injectable()
export class AIImageService {
	private readonly logger = new Logger(AIImageService.name);

	constructor(
		private readonly entityManager: EntityManager,
		private readonly configService: ConfigService,
	) {}

	/**
	 * 生成AI图片
	 * @param dto 生成请求参数
	 * @param userId 用户ID
	 * @returns 生成结果
	 */
	async generateImage(dto: GenerateImageDto, userId: string): Promise<AIImageGenerationResult> {
		const {prompt, seed, width = 1024, height = 1024, saveToAsset = true} = dto;
		const finalSeed = seed || Math.floor(Math.random() * 10_000) + 1;

		try {
			// 构建Pollinations.AI的URL
			const encodedPrompt = encodeURIComponent(prompt);
			const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${finalSeed}&width=${width}&height=${height}&nologo=true`;

			this.logger.log(`开始生成AI图片: ${prompt} (种子: ${finalSeed})`);

			// 验证图片是否能够生成（简单的HTTP HEAD请求）
			const response = await fetch(imageUrl, {method: 'HEAD'});
			if (!response.ok) {
				throw new Error(`图片生成失败: ${response.status} ${response.statusText}`);
			}

			const result: AIImageGenerationResult = {
				id: uuidv4(),
				imageUrl,
				prompt,
				seed: finalSeed,
				status: 'completed',
			};

			// 如果需要保存到Asset系统
			if (saveToAsset) {
				const asset = await this.saveAssetToDatabase(
					userId,
					prompt,
					imageUrl,
					finalSeed,
					width,
					height,
				);
				result.asset = asset;
			}

			this.logger.log(`AI图片生成成功: ${imageUrl}`);
			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			const errorStack = error instanceof Error ? error.stack : undefined;
			this.logger.error(`AI图片生成失败: ${errorMessage}`, errorStack);
			return {
				id: uuidv4(),
				imageUrl: '',
				prompt,
				seed: finalSeed,
				status: 'failed',
				error: errorMessage,
			};
		}
	}

	/**
	 * 保存AI生成的图片到Asset系统
	 * @param userId 用户ID
	 * @param prompt 生成提示词
	 * @param imageUrl 图片URL
	 * @param seed 种子值
	 * @param width 图片宽度
	 * @param height 图片高度
	 * @returns Asset实体
	 */
	private async saveAssetToDatabase(
		userId: string,
		prompt: string,
		imageUrl: string,
		seed: number,
		width: number,
		height: number,
	): Promise<Asset> {
		const fileName = `ai_image_${Date.now()}_${seed}.jpg`;
		const originalName = `AI Generated: ${prompt.slice(0, 50)}...`;

		const asset = new Asset({
			userId,
			fileName,
			originalName,
			filePath: imageUrl, // 使用URL作为文件路径
			fileSize: 0, // AI生成的图片大小未知
			mimeType: 'image/jpeg',
			assetType: AssetType.AI_GENERATED_IMAGE,
			uploadSource: UploadSource.AI_GENERATED,
		});

		// 设置AI生成相关的元数据
		asset.url = imageUrl;
		asset.description = `AI生成图片: ${prompt}`;
		asset.metadata = {
			aiGenerated: true,
			prompt,
			seed,
			width,
			height,
			generatedAt: new Date().toISOString(),
			service: 'Pollinations.AI',
			generationUrl: imageUrl,
		};

		// 添加相关标签
		asset.tags = ['AI生成', 'Pollinations.AI', ...this.extractTagsFromPrompt(prompt)];

		await this.entityManager.persistAndFlush(asset);
		this.logger.log(`AI生成图片已保存到Asset系统: ${asset.id}`);

		return asset;
	}

	/**
	 * 从提示词中提取标签
	 * @param prompt 提示词
	 * @returns 标签数组
	 */
	private extractTagsFromPrompt(prompt: string): string[] {
		const lowerPrompt = prompt.toLowerCase();

		// 标签映射表
		const tagMappings = [
			{keywords: ['forest', 'tree', '森林'], tag: '森林'},
			{keywords: ['ocean', 'sea', '海洋'], tag: '海洋'},
			{keywords: ['mountain', '山'], tag: '山景'},
			{keywords: ['sunset', 'sunrise', '日落'], tag: '日落'},
			{keywords: ['peaceful', 'calm', '宁静'], tag: '宁静'},
			{keywords: ['warm', 'cozy', '温暖'], tag: '温暖'},
			{keywords: ['relaxing', 'soothing', '放松'], tag: '放松'},
			{keywords: ['asmr', 'whisper', '耳语'], tag: 'ASMR'},
			{keywords: ['meditation', '冥想'], tag: '冥想'},
			{keywords: ['sleep', 'bedtime', '睡眠'], tag: '睡眠'},
		];

		return tagMappings
			.filter(mapping => mapping.keywords.some(keyword => lowerPrompt.includes(keyword)))
			.map(mapping => mapping.tag);
	}

	/**
	 * 获取预设的ASMR场景提示词模板
	 * @returns 模板分类
	 */
	getASMRTemplates() {
		return {
			nature: {
				title: '自然景观',
				description: '宁静的自然场景，适合ASMR放松',
				templates: [
					'peaceful forest stream with soft sunlight filtering through green leaves',
					'tranquil mountain lake reflecting clouds at golden sunset',
					'gentle rainfall on moss-covered rocks in a serene garden',
					'soft ocean waves touching a sandy beach under starlight',
					'misty mountain path with wildflowers and butterflies',
					'quiet bamboo forest with gentle breeze and dappled light',
				],
			},
			cozy: {
				title: '温馨环境',
				description: '温暖舒适的室内场景',
				templates: [
					'warm fireplace with soft candlelight in a cozy living room',
					'comfortable reading nook with soft blankets and dim lighting',
					'peaceful bedroom with soft morning light through sheer curtains',
					'vintage study room with books and a warm desk lamp',
					'cozy cafe corner with soft lighting and comfortable chairs',
					'serene tea ceremony setup with delicate porcelain and flowers',
				],
			},
			abstract: {
				title: '抽象艺术',
				description: '柔和的抽象图案和色彩',
				templates: [
					'soft flowing waves in calming blue and lavender tones',
					'gentle abstract patterns in warm earth colors and gold accents',
					'peaceful geometric shapes with soft gradients and light effects',
					'dreamy watercolor textures in pastel pink and blue',
					'minimalist zen patterns with soft curves and natural colors',
					'ethereal light patterns with gentle bokeh effects',
				],
			},
			zen: {
				title: '禅意空间',
				description: '简约禅意的场景设计',
				templates: [
					'minimalist zen garden with carefully arranged stones and sand',
					'simple meditation space with soft cushions and gentle lighting',
					'clean japanese room with tatami mats and paper screens',
					'peaceful temple courtyard with stone lanterns and plants',
					'serene spa environment with candles and natural elements',
					'quiet monastery garden with simple paths and green moss',
				],
			},
		};
	}

	/**
	 * 批量生成图片
	 * @param prompts 提示词数组
	 * @param userId 用户ID
	 * @param baseOptions 基础配置
	 * @returns 生成结果数组
	 */
	async batchGenerateImages(
		prompts: string[],
		userId: string,
		baseOptions: Partial<GenerateImageDto> = {},
	): Promise<AIImageGenerationResult[]> {
		const results: AIImageGenerationResult[] = [];

		for (const prompt of prompts) {
			const result = await this.generateImage(
				{...baseOptions, prompt},
				userId,
			);
			results.push(result);

			// 简单的延迟，避免过快请求
			await new Promise(resolve => setTimeout(resolve, 1000));
		}

		return results;
	}

	/**
	 * 重新生成图片（使用新的种子）
	 * @param originalPrompt 原始提示词
	 * @param userId 用户ID
	 * @param options 配置选项
	 * @returns 新的生成结果
	 */
	async regenerateImage(
		originalPrompt: string,
		userId: string,
		options: Partial<GenerateImageDto> = {},
	): Promise<AIImageGenerationResult> {
		const newSeed = Math.floor(Math.random() * 10_000) + 1;
		return this.generateImage(
			{...options, prompt: originalPrompt, seed: newSeed},
			userId,
		);
	}
}
