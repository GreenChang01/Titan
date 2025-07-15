import {type UserStatus} from '../types/user-status.enum';

/**
 * 用户数据传输对象
 *
 * 用于在前后端之间传输用户信息的标准化数据结构
 * 包含用户的基本信息和状态，不包含敏感数据如密码
 *
 * @example
 * ```typescript
 * const user = new UserDto({
 *   id: 'user-123',
 *   email: 'user@example.com',
 *   username: 'johndoe',
 *   status: UserStatus.ACTIVE,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 * ```
 */
export class UserDto {
  /** 用户唯一标识符 */
  id: string;
  /** 用户创建时间 */
  createdAt: Date;
  /** 用户信息最后更新时间 */
  updatedAt: Date;
  /** 用户邮箱地址（用作登录凭据） */
  email: string;
  /** 用户显示名称 */
  username: string;
  /** 用户当前状态（激活、待确认、被封等） */
  status: UserStatus;

  /**
	 * 创建用户DTO实例
	 *
	 * @param params 用户基本信息参数
	 * @param params.id 用户唯一标识符
	 * @param params.createdAt 用户创建时间
	 * @param params.updatedAt 用户信息最后更新时间
	 * @param params.email 用户邮箱地址
	 * @param params.username 用户显示名称
	 * @param params.status 用户当前状态
	 */
  constructor({
    id,
    createdAt,
    updatedAt,
    email,
    username,
    status,
  }: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    username: string;
    status: UserStatus;
  }) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.email = email;
    this.username = username;
    this.status = status;
  }
}
