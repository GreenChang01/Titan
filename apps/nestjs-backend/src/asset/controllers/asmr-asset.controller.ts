import {
	Controller,
	Get,
	Post,
	Query,
	Body,
	UseGuards,
	Request,
	BadRequestException,
	ParseIntPipe,
	DefaultValuePipe,
} from '@nestjs/common';
import {JwtAuthGuard} from '../../auth/jwt-auth.guard';
import {AssetService} from '../asset.service';
import {Asset} from '../entities/asset.entity';
import {AssetType} from '../../common/enums/asset-type.enum';

/**
 * 创建AI生成素材DTO
 */
export class CreateAIAssetDto {
	/** 素材名称 */
	name!: string;

	/** 素材类型 */
	type!: AssetType;

	/** 素材URL */
	url!: string;

	/** 元数据 */
	metadata?: Record<string, any>;

	/** 标签列表 */
	tags?: string[];

	/** 描述 */
	description?: string;
}

/**
 * 查询ASMR素材DTO
 */
export class QueryASMRAssetsDto {
	/** 分类过滤 */
	category?: string;

	/** 情绪过滤 */
	mood?: string;

	/** 页面大小 */
	limit?: number;

	/** 偏移量 */
	offset?: number;
}

/**
 * ASMR素材管理控制器
 * 提供ASMR素材管理相关的RESTful API
 */
@Controller('assets/asmr')
@UseGuards(JwtAuthGuard)
export class ASMRAssetController {
	constructor(private readonly assetService: AssetService) {}

	/**
	 * 获取ASMR素材列表
	 * @param query 查询参数
	 * @param req 请求对象
	 * @returns ASMR素材列表
	 */
	@Get()
	async getASMRAssets(
		@Query() query: QueryASMRAssetsDto,
		@Request() req: any,
	): Promise<Asset[]> {
		const userId = req.user.id;

		if (query.mood) {
			return this.assetService.getASMRAssetsByMood(userId, query.mood);
		}

		return this.assetService.getASMRAssets(userId, query.category);
	}

	/**
	 * 按情绪获取ASMR素材
	 * @param mood 情绪类型
	 * @param req 请求对象
	 * @returns 符合情绪的素材列表
	 */
	@Get('mood/:mood')
	async getASMRAssetsByMood(
		@Query('mood') mood: string,
		@Request() req: any,
	): Promise<Asset[]> {
		const userId = req.user.id;

		if (!mood?.trim()) {
			throw new BadRequestException('情绪类型不能为空');
		}

		return this.assetService.getASMRAssetsByMood(userId, mood);
	}

	/**
	 * 创建AI生成的ASMR素材
	 * @param createDto 创建参数
	 * @param req 请求对象
	 * @returns 创建的素材
	 */
	@Post('ai-generated')
	async createAIGeneratedAsset(
		@Body() createDto: CreateAIAssetDto,
		@Request() req: any,
	): Promise<Asset> {
		const userId = req.user.id;

		// 验证必需字段
		if (!createDto.name?.trim()) {
			throw new BadRequestException('素材名称不能为空');
		}

		if (!createDto.url?.trim()) {
			throw new BadRequestException('素材URL不能为空');
		}

		// 验证素材类型是否为ASMR相关
		const asmrTypes = [
			AssetType.ASMR_NATURAL_SOUND,
			AssetType.ASMR_WHITE_NOISE,
			AssetType.ASMR_AMBIENT_SOUND,
			AssetType.ASMR_VOICE_SAMPLE,
			AssetType.AI_GENERATED_IMAGE,
		];

		if (!asmrTypes.includes(createDto.type)) {
			throw new BadRequestException('素材类型必须为ASMR相关类型');
		}

		// 验证标签数量
		if (createDto.tags && createDto.tags.length > 20) {
			throw new BadRequestException('标签数量不能超过20个');
		}

		return this.assetService.createAIGeneratedAsset(userId, {
			name: createDto.name,
			type: createDto.type,
			url: createDto.url,
			metadata: createDto.metadata,
			tags: createDto.tags,
			description: createDto.description,
		});
	}

	/**
	 * 获取ASMR素材统计信息
	 * @param req 请求对象
	 * @returns 统计信息
	 */
	@Get('stats')
	async getASMRAssetStats(
		@Request() req: any,
	): Promise<{
			totalCount: number;
			byType: Record<string, number>;
			byMood: Record<string, number>;
			recentUploads: number;
		}> {
		const userId = req.user.id;
		return this.assetService.getASMRAssetStats(userId);
	}

	/**
	 * 获取推荐的ASMR素材
	 * @param req 请求对象
	 * @param mood 情绪类型(可选)
	 * @param limit 限制数量
	 * @returns 推荐素材列表
	 */
	@Get('recommended')
	async getRecommendedAssets(
		@Request() req: any,
		@Query('mood') mood?: string,
		@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
	): Promise<Asset[]> {
		const userId = req.user.id;

		if (limit && limit > 50) {
			throw new BadRequestException('最多返回50个推荐素材');
		}

		// 如果指定了情绪，按情绪推荐
		if (mood) {
			const assets = await this.assetService.getASMRAssetsByMood(userId, mood);
			return assets.slice(0, limit || 10);
		}

		// 否则返回最新的ASMR素材
		const assets = await this.assetService.getASMRAssets(userId);
		return assets.slice(0, limit || 10);
	}

	/**
	 * 获取ASMR素材的情绪分布
	 * @param req 请求对象
	 * @returns 情绪分布统计
	 */
	@Get('mood-distribution')
	async getMoodDistribution(
		@Request() req: any,
	): Promise<Record<string, number>> {
		const userId = req.user.id;
		const stats = await this.assetService.getASMRAssetStats(userId);
		return stats.byMood;
	}

	/**
	 * 获取ASMR素材类型分布
	 * @param req 请求对象
	 * @returns 类型分布统计
	 */
	@Get('type-distribution')
	async getTypeDistribution(
		@Request() req: any,
	): Promise<Record<string, number>> {
		const userId = req.user.id;
		const stats = await this.assetService.getASMRAssetStats(userId);
		return stats.byType;
	}
}
