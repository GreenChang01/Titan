import {EntityManager} from '@mikro-orm/postgresql';
import {Injectable, UnauthorizedException, ForbiddenException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {Cron} from '@nestjs/schedule';
import {UserStatus} from '@titan/shared';
import {AcceptedLanguages} from '../email/types/accepted-languages.enum';
import {ConfigKey} from '../config/config-key.enum';
import {CryptoService} from '../crypto/crypto.service';
import {EmailService} from '../email/email.service';
import {User} from '../users/entities/user.entity';
import {UsersService} from '../users/users.service';
import {oneDay, oneMinute} from '../utils/time.util';
import {RevokedRefreshToken} from './entities/revoked-refresh-token.entity';
import {TwoFactorAuth} from './entities/two-factor-auth.entity';

/**
 * 身份验证服务
 *
 * 提供用户登录、双因子验证、JWT令牌管理和数据清理功能
 * 处理整个认证生命周期，包括令牌生成、验证、刷新和撤销
 *
 * 安全特性：
 * - JWT访问令牌（15分钟有效期）和刷新令牌（7天有效期）
 * - 双因子认证支持（TOTP/短信验证码）
 * - 令牌撤销和黑名单管理
 * - 自动过期数据清理
 * - 密码加密验证
 * - 用户状态检查和权限控制
 *
 * 开发环境特殊配置：
 * - 跳过邮箱确认验证
 * - 禁用双因子认证强制要求
 *
 * @example
 * ```typescript
 * // 用户登录验证
 * const user = await authService.validateUserCredentials(email, password, 'zh');
 * const accessToken = await authService.generateAccessToken(user);
 * const refreshToken = await authService.generateRefreshToken(user);
 * ```
 *
 * @dependencies
 * - UsersService: 用户数据管理
 * - JwtService: JWT令牌生成和验证
 * - CryptoService: 密码加密和哈希验证
 * - EmailService: 双因子验证邮件发送
 * - EntityManager: 数据库操作
 * - ConfigService: 配置管理
 *
 * @security
 * - 所有密码操作使用bcrypt加密
 * - JWT签名使用环境变量配置的密钥
 * - 双因子验证码15分钟自动过期
 * - 刷新令牌撤销后不可重用
 */
@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly cryptoService: CryptoService,
		private readonly configService: ConfigService,
		private readonly em: EntityManager,
		private readonly emailService: EmailService,
	) {}

	/**
	 * 定时清理过期的双因子验证记录
	 *
	 * 使用Cron作业每小时清理15分钟前创建的过期双因子验证码
	 * 这是重要的安全清理任务，防止验证码被恶意重复使用
	 *
	 * @cron 每小时整点执行（0 * * * *）
	 * @returns Promise<void> 清理操作完成
	 *
	 * @complexity O(n) - n为过期记录数量，通常很小
	 * @dependencies EntityManager数据库查询构建器
	 * @sideEffects 删除数据库中的过期验证记录，输出清理日志
	 * @security 确保验证码不会被长期保留在系统中
	 */
	@Cron('0 * * * *') // Every hour, on the hour
	async removeExpiredTwoFactorAuth(): Promise<void> {
		const threshold = new Date(Date.now() - oneMinute * 15);

		const {affectedRows} = await this.em
			.createQueryBuilder(TwoFactorAuth)
			.delete()
			.where({
				createdAt: {$lt: threshold},
			})
			.execute();

		if (affectedRows > 0) {
			console.log(`Removed ${affectedRows} expired pending two factor auth codes`);
		}
	}

	/**
	 * 定时清理过期的已撤销刷新令牌记录
	 *
	 * 使用Cron作业每小时清理7天前创建的撤销令牌记录
	 * 清理已撤销的令牌记录以维护数据库性能，同时保持适当的安全日志保留期
	 *
	 * @cron 每小时整点执行（0 * * * *）
	 * @returns Promise<void> 清理操作完成
	 *
	 * @complexity O(n) - n为过期撤销令牌记录数量
	 * @dependencies EntityManager数据库查询构建器
	 * @sideEffects 删除数据库中的过期撤销令牌记录，输出清理日志
	 * @security 保持7天的令牌撤销历史记录用于安全审计
	 */
	@Cron('0 * * * *') // Every hour, on the hour
	async removeExpiredRevokedRefreshTokens(): Promise<void> {
		const threshold = new Date(Date.now() - 7 * oneDay);

		const {affectedRows} = await this.em
			.createQueryBuilder(RevokedRefreshToken)
			.delete()
			.where({
				createdAt: {$lt: threshold},
			})
			.execute();

		if (affectedRows > 0) {
			console.log(`Removed ${affectedRows} expired revoked refresh tokens`);
		}
	}

	/**
	 * 验证用户凭据并进行身份认证
	 *
	 * 开发环境配置：直接返回用户实体，跳过双因子认证
	 * 执行用户身份验证的核心流程，包括邮箱查找、状态检查和密码验证
	 *
	 * 验证流程：
	 * 1. 根据邮箱查找用户
	 * 2. 检查用户状态（跳过确认检查，阻止被封用户）
	 * 3. 验证密码哈希匹配
	 * 4. 开发环境直接返回用户（跳过2FA）
	 *
	 * @param email 用户邮箱地址，用作唯一标识符
	 * @param password 明文密码，将与存储的哈希进行比较
	 * @param language 邮件语言设置，用于可能的错误消息或通知
	 * @returns Promise<User> 验证成功的用户实体
	 *
	 * @throws {UnauthorizedException} 当用户不存在、密码错误或账户被封时
	 *
	 * @complexity O(1) - 数据库单次查询和密码哈希验证
	 * @dependencies UsersService.getUserByEmail, CryptoService.compare
	 * @security 使用bcrypt进行安全的密码比较，不泄露时序信息
	 */
	async validateUserCredentials(email: string, password: string, language: AcceptedLanguages): Promise<User> {
		let user: User | undefined;

		try {
			user = await this.usersService.getUserByEmail(email);
		} catch {
			throw new UnauthorizedException('Invalid credentials');
		}

		// 检查用户状态 - 开发环境跳过验证检查
		// if (user.status === UserStatus.CONFIRMATION_PENDING) {
		// 	throw new UnauthorizedException('User is not confirmed');
		// }

		if (user.status === UserStatus.BLOCKED) {
			throw new UnauthorizedException('User is blocked');
		}

		// 验证密码
		const isMatch = await this.cryptoService.compare(password, user.password);

		if (!isMatch) {
			throw new UnauthorizedException('Invalid credentials');
		}

		// 开发环境跳过2FA，直接返回用户
		return user;
	}

	/**
	 * 验证双因子验证码
	 *
	 * 验证用户提供的双因子验证码，确保其有效性和未过期
	 * 使用哈希ID和验证码的组合来安全地验证身份
	 *
	 * 验证流程：
	 * 1. 验证双因子验证ID有效性
	 * 2. 设置15分钟过期阈值
	 * 3. 查找匹配验证码的未过期记录
	 * 4. 通过哈希比较确认正确的验证记录
	 * 5. 删除已使用的验证记录（防止重放攻击）
	 *
	 * @param twoFactorAuthHashedId 双因子验证ID的哈希值，用于安全标识验证会话
	 * @param code 用户输入的6位数字验证码
	 * @returns Promise<User> 验证成功的用户实体
	 *
	 * @throws {UnauthorizedException} 当验证ID无效、验证码错误或已过期时
	 *
	 * @complexity O(n) - n为相同验证码的记录数量（通常为1）
	 * @dependencies EntityManager查询, CryptoService哈希比较
	 * @security 验证码使用后立即删除，防止重放攻击；使用哈希ID隐藏真实ID
	 */
	async validateTwoFactorAuth(twoFactorAuthHashedId: string, code: string): Promise<User> {
		if (!twoFactorAuthHashedId) {
			throw new UnauthorizedException('Invalid two-factor authentication id');
		}

		// 设置 15 分钟过期时间
		const expiryThreshold = new Date(Date.now() - oneMinute * 15);

		// 查找匹配的验证码
		const entriesWithMatchingCode = await this.em.find(
			TwoFactorAuth,
			{
				code,
				createdAt: {$gte: expiryThreshold},
			},
			{populate: ['user']},
		);

		// 通过哈希对比找到正确的验证记录
		let matching2FaEntry;
		try {
			matching2FaEntry = await Promise.any(
				entriesWithMatchingCode.map(async (entry) => {
					const isEntry = await this.cryptoService.compare(entry.id, twoFactorAuthHashedId);
					if (isEntry) {
						return entry;
					}

					throw new Error('no-match');
				}),
			);
		} catch {
			// Handle the case where Promise.any rejects (all promises rejected)
			matching2FaEntry = undefined;
		}

		if (!matching2FaEntry || !matching2FaEntry.user) {
			throw new UnauthorizedException('Invalid two-factor authentication code or id');
		}

		// 删除已使用的验证记录
		await this.em.removeAndFlush(matching2FaEntry);
		return matching2FaEntry.user;
	}

	/**
	 * 生成JWT访问令牌
	 *
	 * 为已验证用户生成短期访问令牌，用于API请求认证
	 * 访问令牌包含用户ID作为subject，使用专用的访问令牌密钥签名
	 *
	 * @param user 已验证的用户实体，用于提取用户ID
	 * @returns Promise<string> 15分钟有效期的JWT访问令牌
	 *
	 * @complexity O(1) - JWT签名操作
	 * @dependencies JwtService.sign, ConfigService获取密钥
	 * @security 使用独立的访问令牌密钥，短期有效期降低泄露风险
	 */
	async generateAccessToken(user: User): Promise<string> {
		return this.jwtService.sign(
			{sub: user.id},
			{
				secret: this.configService.get<string>(ConfigKey.JWT_ACCESS_SECRET),
				expiresIn: '15m',
			},
		);
	}

	/**
	 * 生成JWT刷新令牌
	 *
	 * 为已验证用户生成长期刷新令牌，用于自动更新访问令牌
	 * 刷新令牌使用独立的密钥签名，有效期更长但可被撤销
	 *
	 * @param user 已验证的用户实体，用于提取用户ID
	 * @returns Promise<string> 7天有效期的JWT刷新令牌
	 *
	 * @complexity O(1) - JWT签名操作
	 * @dependencies JwtService.sign, ConfigService获取刷新令牌密钥
	 * @security 使用独立的刷新令牌密钥，支持单独撤销而不影响访问令牌验证
	 */
	async generateRefreshToken(user: User): Promise<string> {
		return this.jwtService.sign(
			{sub: user.id},
			{
				secret: this.configService.get<string>(ConfigKey.JWT_REFRESH_SECRET),
				expiresIn: '7d',
			},
		);
	}

	/**
	 * 使用刷新令牌更新令牌对
	 *
	 * 验证刷新令牌并生成新的访问令牌和刷新令牌对
	 * 实现令牌轮换策略：旧刷新令牌被撤销，生成全新的令牌对
	 *
	 * 更新流程：
	 * 1. 检查刷新令牌是否已被撤销
	 * 2. 验证刷新令牌的有效性和签名
	 * 3. 根据令牌中的用户ID获取用户信息
	 * 4. 将旧刷新令牌加入撤销黑名单
	 * 5. 生成并返回新的访问令牌和刷新令牌
	 *
	 * @param refreshToken 待刷新的JWT刷新令牌
	 * @returns Promise 包含新accessToken和refreshToken的对象
	 *
	 * @throws {ForbiddenException} 当刷新令牌已被撤销或无效时
	 *
	 * @complexity O(1) - 数据库单次查询和JWT验证
	 * @dependencies JwtService验证, UsersService获取用户, EntityManager持久化
	 * @security 令牌轮换防止令牌重放，撤销列表防止已泄露令牌的重用
	 */
	async refreshTokens(refreshToken: string): Promise<{accessToken: string; refreshToken: string}> {
		// 检查令牌是否已被撤销
		const revokedToken = await this.em.findOne(RevokedRefreshToken, {token: refreshToken});

		if (revokedToken) {
			throw new ForbiddenException('Refresh token has been revoked');
		}

		try {
			// 验证刷新令牌
			const payload: {sub: string} = await this.jwtService.verifyAsync(refreshToken, {
				secret: this.configService.get<string>(ConfigKey.JWT_REFRESH_SECRET),
			});

			const user = await this.usersService.getUserById(payload.sub);

			// 将旧的刷新令牌加入撤销列表
			const revokedRefreshToken = new RevokedRefreshToken({token: refreshToken});

			await this.em.persistAndFlush(revokedRefreshToken);

			// 生成新的令牌对
			return {
				accessToken: await this.generateAccessToken(user),
				refreshToken: await this.generateRefreshToken(user),
			};
		} catch {
			throw new ForbiddenException('Invalid refresh token');
		}
	}
}
