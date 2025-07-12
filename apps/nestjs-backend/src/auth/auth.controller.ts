import {Controller, Post, Body, Res, Req, HttpCode, HttpStatus} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ApiResponse, ApiTags, ApiOperation} from '@nestjs/swagger';
import {Throttle} from '@nestjs/throttler';
import type {Response, Request} from 'express';
import {LoginCredentialsBodyDto, LoginTwoFactorAuthBodyDto} from '@titan/shared';
import {ConfigKey} from '../config/config-key.enum';
import {oneMinute, oneWeek} from '../utils/time.util';
import {ValidateHeader} from '../common/decorators/validate-header/validate-header.decorator';
import {AcceptedLanguages} from '../email/types/accepted-languages.enum';
import {AuthService} from './auth.service';
import {Public} from './decorators/public.decorator';

// Cookie 键名常量
// eslint-disable-next-line @typescript-eslint/naming-convention
const ACCESS_TOKEN_COOKIE_KEY = 'access_token';
// eslint-disable-next-line @typescript-eslint/naming-convention
const REFRESH_TOKEN_COOKIE_KEY = 'refresh_token';
// eslint-disable-next-line @typescript-eslint/naming-convention
const TWO_FACTOR_AUTH_COOKIE_KEY = 'two_factor_auth';

/**
 * 身份验证控制器
 * 处理用户登录、双因子验证、令牌刷新和退出登录的 API 端点
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 用户凭据登录并发送双因子验证码
   * 接受用户邮箱和密码，验证成功后发送双因子验证码到邮箱
   */
  @Post('login/credentials')
  @Public()
  @Throttle({default: {ttl: oneMinute, limit: 5}})
  @ApiOperation({
    summary: 'Login with credentials and issue 2FA code',
    description:
      'This endpoint accepts user credentials (email and password) and issues a 2FA code for further authentication.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful, 2FA code issued.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials.',
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
    const twoFactorAuthHashedId = await this.authService.validateUserCredentials(
      loginDto.email,
      loginDto.password,
      language,
    );

    // 设置双因子验证 Cookie（15 分钟有效期）
    response.cookie(TWO_FACTOR_AUTH_COOKIE_KEY, twoFactorAuthHashedId, {
      httpOnly: true,
      secure: this.configService.get<string>(ConfigKey.NODE_ENV) === 'production',
      sameSite: 'lax',
      maxAge: oneMinute * 15, // 15 minutes
    });
  }

  /**
   * 双因子验证码登录并生成令牌
   * 验证双因子验证码，成功后生成访问令牌和刷新令牌
   */
  @Post('login/2fa')
  @Public()
  @Throttle({default: {ttl: oneMinute, limit: 5}})
  @ApiOperation({
    summary: 'Login with 2FA code and generate tokens',
    description: 'This endpoint verifies the provided 2FA code and generates access and refresh tokens for the user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful, tokens generated.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid 2FA code.',
  })
  @HttpCode(HttpStatus.OK)
  async login2fa(
    @Body() body: LoginTwoFactorAuthBodyDto,
    @Req() req: Request,
    @Res({passthrough: true}) response: Response,
  ): Promise<void> {
    const {code} = body;
    const twoFactorAuthHashedId = req.cookies[TWO_FACTOR_AUTH_COOKIE_KEY] as string;
    const user = await this.authService.validateTwoFactorAuth(twoFactorAuthHashedId, code);

    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);

    // 设置访问令牌 Cookie（15 分钟有效期）
    response.cookie(ACCESS_TOKEN_COOKIE_KEY, accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>(ConfigKey.NODE_ENV) === 'production',
      sameSite: 'lax',
      maxAge: oneMinute * 15, // 15 minutes
    });

    // 设置刷新令牌 Cookie（7 天有效期）
    response.cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>(ConfigKey.NODE_ENV) === 'production',
      sameSite: 'lax',
      maxAge: oneWeek,
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
    summary: 'Refresh access and refresh tokens',
    description: 'This endpoint refreshes the access and refresh tokens using the provided refresh token.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens refreshed successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token.',
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
    summary: 'Logout and clear authentication cookies',
    description: 'This endpoint clears the access and refresh tokens from the cookies and logs out the user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logged out successfully.',
  })
  async logout(@Res({passthrough: true}) response: Response): Promise<void> {
    response.clearCookie(ACCESS_TOKEN_COOKIE_KEY);
    response.clearCookie(REFRESH_TOKEN_COOKIE_KEY);
  }
}
