import {Entity, ManyToOne, Property, types} from '@mikro-orm/core';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {User} from '../../users/entities/user.entity';

/**
 * 双因子验证实体
 * 存储用户登录时生成的双因子验证码和相关信息
 */
@Entity()
export class TwoFactorAuth extends BaseEntity {
	/** 关联的用户 */
	@ManyToOne(() => User)
	user: User;

	/** 验证码 */
	@Property({type: types.string, nullable: false})
	code: string;

	constructor({user, code}: {user: User; code: string}) {
		super();
		this.user = user;
		this.code = code;
	}
}
