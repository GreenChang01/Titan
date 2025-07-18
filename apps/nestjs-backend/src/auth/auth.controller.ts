import {Controller, Post, Body, Res, Req, HttpCode, HttpStatus} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ApiResponse, ApiTags, ApiOperation} from '@nestjs/swagger';
import {Throttle} from '@nestjs/throttler';
import type {Response, Request} from 'express';
import {LoginCredentialsBodyDto} from '@titan/shared';
import {ConfigKey} from '../config/config-key.enum';
import {oneMinute, oneWeek, oneDay} from '../utils/time.util';
import {ValidateHeader} from '../common/decorators/validate-header/validate-header.decorator';
import {AcceptedLanguages} from '../email/types/accepted-languages.enum';
import {AuthService} from './auth.service';
import {Public} from './decorators/public.decorator';

// Cookie 键名常量
const ACCESS_TOKEN_COOKIE_KEY = 'access_token';
const REFRESH_TOKEN_COOKIE_KEY = 'refresh_token';

/**
 * 身份验证控制器 - 单用户简化版
 * 处理用户登录、令牌刷新和退出登录的 API 端点
 */
@ApiTags('身份验证')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {}

	/**
	 * 单用户直接登录
	 * 接受用户邮箱和密码，验证成功后直接生成访问令牌
	 */
	@Post('login/credentials')
	@Public()
	@Throttle({default: {ttl: oneMinute, limit: 5}})
	@ApiOperation({
		summary: '单用户直接登录',
		description: '接受用户邮箱和密码，验证成功后直接生成访问令牌和刷新令牌',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '登录成功，令牌已生成',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: '用户凭据无效',
	})
	@HttpCode(HttpStatus.OK)
	async login(
		@Body() loginDto: LoginCredentialsBodyDto,
		@Res({passthrough: true}) response: Response,
		@ValidateHeader({
			headerName: 'Accept-Language',
			options: {
				expectedValue: AcceptedLanguages,
			},
		})
		language: AcceptedLanguages,
	): Promise<void> {
		// 单用户模式：直接验证用户并生成令牌，无需2FA
		const user = await this.authService.validateUserCredentials(loginDto.email, loginDto.password, language);

		// 直接生成并设置访问令牌和刷新令牌 Cookie
		const accessToken = await this.authService.generateAccessToken(user);
		const refreshToken = await this.authService.generateRefreshToken(user);

		response.cookie(ACCESS_TOKEN_COOKIE_KEY, accessToken, {
			httpOnly: true,
			secure: this.configService.get<string>(ConfigKey.NODE_ENV) === 'production',
			sameSite: 'lax',
			maxAge: oneDay * 7, // 7 days
		});

		response.cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, {
			httpOnly: true,
			secure: this.configService.get<string>(ConfigKey.NODE_ENV) === 'production',
			sameSite: 'lax',
			maxAge: oneDay * 30, // 30 days
		});
	}

	/**
	 * 刷新访问令牌和刷新令牌
	 * 使用刷新令牌来获取新的令牌对
	 */
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	@Public()
	@ApiOperation({
		summary: '刷新访问令牌和刷新令牌',
		description: '使用刷新令牌来获取新的令牌对，保持用户登录状态',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '令牌刷新成功',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: '刷新令牌无效',
	})
	@HttpCode(HttpStatus.OK)
	async refresh(@Req() req: Request, @Res({passthrough: true}) response: Response): Promise<void> {
		const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY] as string;
		const {accessToken, refreshToken: newRefreshToken} = await this.authService.refreshTokens(refreshToken);

		// 清除旧的刷新令牌 Cookie
		response.clearCookie(REFRESH_TOKEN_COOKIE_KEY);

		// 设置新的访问令牌 Cookie
		response.cookie(ACCESS_TOKEN_COOKIE_KEY, accessToken, {
			httpOnly: true,
			secure: this.configService.get<string>(ConfigKey.NODE_ENV) === 'production',
			sameSite: 'lax',
			maxAge: oneMinute * 15, // 15 minutes
		});

		// 设置新的刷新令牌 Cookie
		response.cookie(REFRESH_TOKEN_COOKIE_KEY, newRefreshToken, {
			httpOnly: true,
			secure: this.configService.get<string>(ConfigKey.NODE_ENV) === 'production',
			sameSite: 'lax',
			maxAge: oneWeek,
		});
	}

	/**
	 * 退出登录并清除认证 Cookie
	 * 清除访问令牌和刷新令牌的 Cookie
	 */
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: '退出登录并清除认证Cookie',
		description: '清除访问令牌和刷新令牌的Cookie，完成用户退出登录',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '退出登录成功',
	})
	async logout(@Res({passthrough: true}) response: Response): Promise<void> {
		response.clearCookie(ACCESS_TOKEN_COOKIE_KEY);
		response.clearCookie(REFRESH_TOKEN_COOKIE_KEY);
	}
}
