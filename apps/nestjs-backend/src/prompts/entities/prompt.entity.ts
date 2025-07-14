import {Entity, Property, Enum, Index, ManyToMany, Collection} from '@mikro-orm/core';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {PromptCategory} from '../../common/enums';
import {PromptTag} from './prompt-tag.entity';

/**
 * AI提示词实体
 * 存储用户创建和AI生成的提示词内容
 */
@Entity({tableName: 'ai_prompt'})
@Index({properties: ['userId', 'createdAt']})
@Index({properties: ['userId', 'category']})
@Index({properties: ['isPublic', 'category']})
@Index({properties: ['usageCount']})
export class AIPrompt extends BaseEntity {
	/**
	 * 用户ID - 提示词归属用户
	 */
	@Property()
	userId: string;

	/**
	 * 提示词标题
	 */
	@Property()
	title: string;

	/**
	 * 提示词内容
	 */
	@Property({type: 'text'})
	content: string;

	/**
	 * 提示词分类
	 */
	@Enum(() => PromptCategory)
	@Property({nullable: true})
	category?: PromptCategory;

	/**
	 * 是否公开 - 公开的提示词可以被其他用户查看
	 */
	@Property({default: false})
	isPublic = false;

	/**
	 * 是否AI生成 - 标记该提示词是否由AI生成
	 */
	@Property({default: false})
	isAiGenerated = false;

	/**
	 * AI生成参数 - 存储生成该提示词时使用的参数
	 */
	@Property({type: 'json', nullable: true})
	generationParams?: Record<string, any>;

	/**
	 * 使用次数 - 记录该提示词被使用的次数
	 */
	@Property({default: 0})
	usageCount = 0;

	/**
	 * 评分 - 用户对该提示词的评分
	 */
	@Property({type: 'decimal', precision: 3, scale: 2, default: 0})
	rating = 0;

	/**
	 * 关联的标签
	 */
	@ManyToMany(() => PromptTag, 'prompts')
	tags = new Collection<PromptTag>(this);

	/**
	 * 构造函数
	 */
	constructor(data: {
		userId: string;
		title: string;
		content: string;
		category?: PromptCategory;
		isPublic?: boolean;
		isAiGenerated?: boolean;
		generationParams?: Record<string, any>;
	}) {
		super();
		this.userId = data.userId;
		this.title = data.title;
		this.content = data.content;
		this.category = data.category;
		this.isPublic = data.isPublic ?? false;
		this.isAiGenerated = data.isAiGenerated ?? false;
		this.generationParams = data.generationParams;
	}
}
