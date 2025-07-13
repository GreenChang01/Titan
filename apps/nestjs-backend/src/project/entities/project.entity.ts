import {Cascade, Collection, Entity, ManyToOne, OneToMany, Property, types, Enum, Index} from '@mikro-orm/core';
import {User} from '../../users/entities/user.entity';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {ProjectMaterial} from '../../project-material/entities/project-material.entity';
import {ProjectStatus} from '../../common/enums';

/**
 * 项目实体
 * 存储用户创建的项目信息和相关的素材资源
 */
@Entity()
@Index({properties: ['user', 'createdAt']})
@Index({properties: ['status']})
export class Project extends BaseEntity {
	/** 项目名称 */
	@Property({type: types.string, nullable: false})
	name!: string;

	/** 项目描述 */
	@Property({type: types.text, nullable: true})
	description?: string;

	/** 项目颜色标识 */
	@Property({type: types.string, nullable: true})
	color?: string;

	/** 项目状态 */
	@Enum(() => ProjectStatus)
	status: ProjectStatus = ProjectStatus.ACTIVE;

	/** 关联素材数量 */
	@Property({type: types.integer, default: 0})
	assetCount = 0;

	/** 生成内容数量 */
	@Property({type: types.integer, default: 0})
	contentCount = 0;

	/** 项目所有者 */
	@ManyToOne(() => User, {nullable: false, fieldName: 'user_id'})
	user!: User;

	/** 项目包含的素材列表 */
	@OneToMany(() => ProjectMaterial, (material) => material.project, {
		cascade: [Cascade.REMOVE],
	})
	materials = new Collection<ProjectMaterial>(this);

	/** 项目是否激活状态 */
	@Property({type: types.boolean, default: true})
	isActive = true;

	/** 最后访问时间 */
	@Property({type: types.datetime, columnType: 'timestamp', nullable: true})
	lastAccessedAt?: Date;

	constructor({name, description, color, user}: {name: string; description?: string; color?: string; user: User}) {
		super();
		this.name = name;
		this.description = description;
		this.color = color;
		this.user = user;
	}
}
