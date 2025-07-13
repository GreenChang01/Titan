import {Buffer} from 'node:buffer';
import {EntityManager} from '@mikro-orm/postgresql';
import {GoneException, Injectable, NotFoundException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Cron} from '@nestjs/schedule';
import {v4 as uuidv4} from 'uuid';
import {UserStatus} from '@titan/shared';
import {AcceptedLanguages} from '../email/types/accepted-languages.enum';
import {ConfigKey} from '../config/config-key.enum';
import {CryptoService} from '../crypto/crypto.service';
import {EmailService} from '../email/email.service';
import {oneDay, oneHour} from '../utils/time.util';
import {AliyunDriveConfig} from '../aliyun-drive/entities/aliyun-drive-config.entity';
import {User} from './entities/user.entity';

/**
 * 用户管理服务
 *
 * 提供完整的用户生命周期管理功能，包括注册、验证、密码管理和用户信息维护
 * 实现邮箱确认机制、密码重置流程和自动清理功能
 *
 * 主要功能：
 * - 用户注册和邮箱确认机制
 * - 密码重置和安全验证
 * - 用户信息查询和更新
 * - 定时清理过期待确认用户
 * - 阿里云盘配置状态检查
 *
 * 安全特性：
 * - 密码哈希存储（不存储明文）
 * - 邮箱确认防止虚假注册
 * - 密码重置令牌时效性控制
 * - 防止用户枚举攻击
 * - 自动清理机制防止垃圾数据堆积
 *
 * 业务流程：
 * 1. 用户注册 -> 发送确认邮件 -> 待确认状态
 * 2. 邮箱确认 -> 用户激活 -> 正常使用
 * 3. 密码重置 -> 发送重置邮件 -> 验证令牌 -> 更新密码
 * 4. 24小时后自动清理未确认的注册账户
 *
 * @example
 * ```typescript
 * // 创建用户
 * const user = await usersService.createUser(
 *   "user@example.com",
 *   "password123",
 *   "username",
 *   AcceptedLanguages.zh_CN
 * );
 *
 * // 确认用户
 * await usersService.confirmUser(confirmationCode);
 *
 * // 密码重置
 * await usersService.requestPasswordReset("user@example.com", AcceptedLanguages.zh_CN);
 * await usersService.confirmPasswordReset(resetToken, "newPassword");
 * ```
 *
 * @dependencies
 * - EntityManager: MikroORM实体管理器
 * - CryptoService: 密码哈希和令牌生成
 * - EmailService: 邮件发送服务
 * - ConfigService: 系统配置管理
 *
 * @security
 * - 所有密码使用安全哈希算法存储
 * - 确认码和重置令牌使用加密随机生成
 * - 时效性控制防止令牌滥用
 * - 用户枚举保护机制
 */
@Injectable()
export class UsersService {
	constructor(
		private readonly em: EntityManager,
		private readonly cryptoService: CryptoService,
		private readonly emailService: EmailService,
		private readonly configService: ConfigService,
	) {}

	/**
	 * 定时清理过期的待确认用户
	 * 每小时整点执行，清理 24 小时前创建的待确认用户
	 */
	@Cron('0 * * * *') // Every hour, on the hour
	async removeExpiredPendingUsers(): Promise<void> {
		const threshold = new Date(Date.now() - oneDay);

		const {affectedRows} = await this.em
			.createQueryBuilder(User)
			.delete()
			.where({
				status: UserStatus.CONFIRMATION_PENDING,
				createdAt: {$lt: threshold},
			})
			.execute();

		if (affectedRows > 0) {
			console.log(`Removed ${affectedRows} expired pending users`);
		}
	}

	/**
	 * 根据用户 ID 获取用户
	 * @param userId 用户 ID
	 * @returns 用户实体
	 * @throws NotFoundException 当用户不存在时
	 */
	async getUserById(userId: string): Promise<User> {
		const user = await this.em.findOne(User, {id: userId});
		if (!user) {
			throw new NotFoundException(`User with id ${userId} not found`);
		}

		return user;
	}

	/**
	 * 根据邮箱地址获取用户
	 * @param email 邮箱地址
	 * @returns 用户实体
	 * @throws NotFoundException 当用户不存在时
	 */
	async getUserByEmail(email: string): Promise<User> {
		const user = await this.em.findOne(User, {email});
		if (!user) {
			throw new NotFoundException(`User with email ${email} not found`);
		}

		return user;
	}

	/**
	 * 根据用户名获取用户
	 * @param username 用户名
	 * @returns 用户实体
	 * @throws NotFoundException 当用户不存在时
	 */
	async getUserByUsername(username: string): Promise<User> {
		const user = await this.em.findOne(User, {username});
		if (!user) {
			throw new NotFoundException(`User with username ${username} not found`);
		}

		return user;
	}

	/**
	 * 创建新用户
	 * @param email 邮箱地址
	 * @param password 密码
	 * @param username 用户名
	 * @param language 邮件语言
	 * @returns 创建的用户实体
	 */
	async createUser(email: string, password: string, username: string, language: AcceptedLanguages): Promise<User> {
		// 生成 Base64url 编码的确认码，防止 URL 中的特殊字符问题
		const confirmationCode = Buffer.from(await this.cryptoService.hash(uuidv4())).toString('base64url');
		const hashedPassword = await this.cryptoService.hash(password);

		const userEntity = new User({
			email,
			password: hashedPassword,
			username,
			confirmationCode,
		});

		// 发送确认邮件
		const confirmationLink = `${this.configService.get<string>(ConfigKey.FRONTEND_HOST)}/confirm?token=${userEntity.confirmationCode}`;
		await this.emailService.sendConfirmEmail(language, username, email, confirmationLink);

		await this.em.persistAndFlush(userEntity);

		return userEntity;
	}

	/**
	 * 确认用户注册
	 * @param confirmationCode 确认码
	 * @returns 确认后的用户实体
	 * @throws NotFoundException 当确认码不存在时
	 * @throws GoneException 当确认码过期时
	 */
	async confirmUser(confirmationCode: string): Promise<User> {
		const user = await this.em.findOne(User, {confirmationCode});

		// 如果用户不存在，抛出错误
		if (!user) {
			throw new NotFoundException(`User with confirmation code ${confirmationCode} not found`);
		}

		// 如果用户已经激活，直接返回
		if (user.status === UserStatus.ACTIVE) {
			return user;
		}

		// 如果确认码超过 24 小时，删除用户并抛出错误
		if (new Date(user.createdAt).getTime() + oneDay < Date.now()) {
			await this.em.removeAndFlush(user);
			throw new GoneException(`Confirmation code ${confirmationCode} expired`);
		}

		// 激活用户
		user.status = UserStatus.ACTIVE;
		await this.em.persistAndFlush(user);
		return user;
	}

	/**
	 * 删除用户
	 * @param userId 用户 ID
	 */
	async deleteUser(userId: string): Promise<void> {
		const user = await this.getUserById(userId);

		await this.em.removeAndFlush(user);
	}

	/**
	 * 请求密码重置
	 * @param email 邮箱地址
	 * @param language 邮件语言
	 */
	async requestPasswordReset(email: string, language: AcceptedLanguages): Promise<void> {
		let user: User | undefined;

		try {
			user = await this.getUserByEmail(email);
		} catch {
			return; // 不泄露用户是否存在
		}

		// 生成重置令牌
		const resetToken = Buffer.from(await this.cryptoService.hash(uuidv4())).toString('base64url');
		user.passwordResetToken = resetToken;
		user.passwordResetTokenCreatedAt = new Date(Date.now());

		// 发送重置密码邮件
		const resetLink = `${this.configService.get<string>(ConfigKey.FRONTEND_HOST)}/reset-password?token=${resetToken}`;
		await this.emailService.sendRequestPasswordResetEmail(language, email, user.username, resetLink);

		await this.em.persistAndFlush(user);
	}

	/**
	 * 确认密码重置
	 * @param resetToken 重置令牌
	 * @param newPassword 新密码
	 * @throws NotFoundException 当重置令牌不存在时
	 * @throws GoneException 当重置令牌过期时
	 */
	async confirmPasswordReset(resetToken: string, newPassword: string): Promise<void> {
		const user = await this.em.findOne(User, {passwordResetToken: resetToken});

		// 如果用户不存在，抛出错误
		if (!user) {
			throw new NotFoundException(`User with reset token ${resetToken} not found`);
		}

		// 如果重置令牌超过 2 小时，抛出错误
		if (
			user.passwordResetTokenCreatedAt
			&& new Date(user.passwordResetTokenCreatedAt).getTime() + 2 * oneHour < Date.now()
		) {
			throw new GoneException(`Reset token ${resetToken} expired`);
		}

		// 清除重置令牌
		user.passwordResetToken = undefined;
		user.passwordResetTokenCreatedAt = undefined;

		// 更新密码
		user.password = await this.cryptoService.hash(newPassword);
		await this.em.persistAndFlush(user);
	}

	/**
	 * 更新用户信息
	 * @param userId 用户 ID
	 * @param email 新邮箱地址（可选）
	 * @param username 新用户名（可选）
	 * @param password 新密码（可选）
	 * @returns 更新后的用户实体
	 */
	async updateUser(userId: string, email?: string, username?: string, password?: string): Promise<User> {
		const user = await this.getUserById(userId);

		if (email) {
			user.email = email;
		}

		if (username) {
			user.username = username;
		}

		if (password) {
			user.password = await this.cryptoService.hash(password);
		}

		await this.em.persistAndFlush(user);
		return user;
	}

	/**
	 * 检查用户的阿里云盘配置状态
	 * @param userId 用户 ID
	 * @returns 是否已配置并激活阿里云盘
	 */
	async checkAliyunDriveConfigStatus(userId: string): Promise<boolean> {
		const config = await this.em.findOne(AliyunDriveConfig, {
			user: userId,
		});
		return Boolean(config?.isActive);
	}
}
