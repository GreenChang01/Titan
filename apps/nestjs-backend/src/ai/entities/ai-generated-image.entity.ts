import {Entity, Property, OneToOne, Index} from '@mikro-orm/core';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {Asset} from '../../asset/entities/asset.entity';

/**
 * AI生成图片实体
 * 存储通过Pollinations.AI生成的图片元数据
 */
@Entity({tableName: 'ai_generated_image'})
@Index({properties: ['generatedAt']})
export class AIGeneratedImage extends BaseEntity {
	/**
	 * 关联的素材 - 一对一关系
	 */
	@OneToOne(() => Asset, {unique: true})
	asset: Asset;

	/**
	 * 生成提示词 - 用于生成图片的文本描述
	 */
	@Property({type: 'text'})
	prompt: string;

	/**
	 * 随机种子 - Pollinations.AI使用的随机种子
	 */
	@Property()
	seed: number;

	/**
	 * 生成URL - 完整的Pollinations.AI请求URL
	 */
	@Property({type: 'text'})
	generationUrl: string;

	/**
	 * Pollinations.AI参数 - 存储生成时使用的所有参数
	 */
	@Property({type: 'json', nullable: true})
	pollinationsParams?: {
		nologo?: boolean;
		width?: number;
		height?: number;
		model?: string;
		[key: string]: any;
	};

	/**
	 * 生成时间 - 图片生成的时间戳
	 */
	@Property({default: 'now()'})
	generatedAt: Date = new Date();

	/**
	 * 构造函数
	 */
	constructor(data: {
		asset: Asset;
		prompt: string;
		seed: number;
		generationUrl: string;
		pollinationsParams?: Record<string, any>;
	}) {
		super();
		this.asset = data.asset;
		this.prompt = data.prompt;
		this.seed = data.seed;
		this.generationUrl = data.generationUrl;
		this.pollinationsParams = data.pollinationsParams;
	}
}
