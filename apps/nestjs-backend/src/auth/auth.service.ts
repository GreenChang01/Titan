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
 * 提供用户登录、双因子验证、JWT 令牌管理和数据清理功能
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
	 * 每小时整点执行，清理 15 分钟前创建的记录
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
	 * 每小时整点执行，清理 7 天前创建的记录
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
	 * 验证用户凭据 - 开发环境直接返回用户，跳过2FA
	 * @param email 用户邮箱
	 * @param password 用户密码
	 * @param language 邮件语言
	 * @returns 用户实体
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
	 * @param twoFactorAuthHashedId 双因子验证 ID 的哈希值
	 * @param code 用户输入的验证码
	 * @returns 验证成功的用户实体
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
	 * 生成访问令牌
	 * @param user 用户实体
	 * @returns JWT 访问令牌（15 分钟有效期）
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
	 * 生成刷新令牌
	 * @param user 用户实体
	 * @returns JWT 刷新令牌（7 天有效期）
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
	 * @param refreshToken 刷新令牌
	 * @returns 新的访问令牌和刷新令牌
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
