import {Cascade, Collection, Entity, Enum, OneToMany, Property, types, Unique} from '@mikro-orm/core';
import {UserStatus} from '@titan/shared';
import {TwoFactorAuth} from '../../auth/entities/two-factor-auth.entity';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {AliyunDriveConfig} from '../../aliyun-drive/entities/aliyun-drive-config.entity';
import {Project} from '../../project/entities/project.entity';

/**
 * 用户实体
 * 存储用户的基本信息、认证相关数据和关联关系
 */
@Entity()
export class User extends BaseEntity {
	/** 用户邮箱地址（唯一） */
	@Property({type: types.string, nullable: false})
	@Unique()
	email: string;

	/** 用户密码的哈希值 */
	@Property({type: types.string, nullable: false})
	password: string;

	/** 用户名（唯一） */
	@Property({type: types.string, nullable: false})
	@Unique()
	username: string;

	/** 邮箱确认码 */
	@Property({type: types.string, nullable: false})
	confirmationCode: string;

	/** 用户状态（待确认/已激活/已阻止） */
	@Enum(() => UserStatus)
	status: UserStatus = UserStatus.CONFIRMATION_PENDING;

	/** 密码重置令牌 */
	@Property({type: types.string, nullable: true})
	passwordResetToken?: string | undefined;

	/** 密码重置令牌创建时间 */
	@Property({type: types.datetime, columnType: 'timestamp', nullable: true})
	passwordResetTokenCreatedAt?: Date | undefined;

	/** 关联的双因子验证记录 */
	@OneToMany(() => TwoFactorAuth, (twoFactorAuth) => twoFactorAuth.user, {
		cascade: [Cascade.REMOVE],
		nullable: true,
	})
	twoFactorAuth?: TwoFactorAuth[];

	/** 关联的阿里云盘配置 */
	@OneToMany(() => AliyunDriveConfig, (config) => config.user, {
		cascade: [Cascade.REMOVE],
		nullable: true,
	})
	aliyunDriveConfig?: AliyunDriveConfig[];

	/** 关联的项目列表 */
	@OneToMany(() => Project, (project) => project.user, {
		cascade: [Cascade.REMOVE],
	})
	projects = new Collection<Project>(this);

	/** 微信视频号ID */
	@Property({type: types.string, nullable: true})
	wechatVideoChannelId?: string;

	/** 订阅计划 */
	@Property({type: types.string, default: 'free'})
	subscriptionPlan = 'free';

	/** 内容配额 */
	@Property({type: types.integer, default: 10})
	contentQuota = 10;

	constructor({
		email,
		password,
		username,
		confirmationCode,
	}: {
		email: string;
		password: string;
		username: string;
		confirmationCode: string;
	}) {
		super();
		this.email = email;
		this.password = password;
		this.username = username;
		this.confirmationCode = confirmationCode;
	}
}
