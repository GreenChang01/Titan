import {Entity, Property, ManyToMany, Collection, Index} from '@mikro-orm/core';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {AIPrompt} from './prompt.entity';

/**
 * 提示词标签实体
 * 用于对AI提示词进行分类和标记
 */
@Entity({tableName: 'prompt_tag'})
@Index({properties: ['category', 'usageCount']})
export class PromptTag extends BaseEntity {
	/**
	 * 标签名称 - 唯一标识符
	 */
	@Property({unique: true})
	name: string;

	/**
	 * 标签分类 - 用于组织标签
	 */
	@Property({nullable: true})
	category?: string;

	/**
	 * 标签颜色 - 用于UI显示
	 */
	@Property({default: '#3B82F6'})
	color = '#3B82F6';

	/**
	 * 使用次数 - 记录该标签被使用的次数
	 */
	@Property({default: 0})
	usageCount = 0;

	/**
	 * 关联的提示词
	 */
	@ManyToMany(() => AIPrompt, 'tags', {owner: true})
	prompts = new Collection<AIPrompt>(this);

	/**
	 * 构造函数
	 */
	constructor(data: {name: string; category?: string; color?: string}) {
		super();
		this.name = data.name;
		this.category = data.category;
		this.color = data.color ?? '#3B82F6';
	}
}
