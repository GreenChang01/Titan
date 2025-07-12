import {Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post} from '@nestjs/common';
import {ApiResponse, ApiTags, ApiOperation} from '@nestjs/swagger';
import {Throttle} from '@nestjs/throttler';
import {
  CreateUserBodyDto,
  ResetPasswordConfirmBodyDto,
  UserDto,
  ResetPasswordRequestBodyDto,
  UpdateUserBodyDto,
} from '@titan/shared';
import {ValidateHeader} from '../common/decorators/validate-header/validate-header.decorator';
import {AcceptedLanguages} from '../email/types/accepted-languages.enum';
import {Public} from '../auth/decorators/public.decorator';
import {User} from '../auth/decorators/user.decorator';
import type {ActiveUser} from '../auth/types/active-user.type';
import {oneHour, oneMinute} from '../utils/time.util';
import {ConfirmUserParamDto} from './dto/confirm-user.param.dto';
import {UsersService} from './users.service';

/**
 * 用户控制器
 * 处理用户相关的 API 端点，包括创建、查询、更新、删除、确认和密码重置
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 获取当前用户信息
   * 返回当前认证用户的详细信息
   */
  @Get('me')
  @ApiOperation({
    summary: 'Get current user details',
    description: 'This endpoint retrieves the details of the currently authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved user details.',
    type: UserDto,
  })
  async getMe(@User() user: ActiveUser): Promise<UserDto> {
    const {userId} = user;
    const userEntity = await this.usersService.getUserById(userId);
    return new UserDto(userEntity);
  }

  /**
   * 创建新用户
   * 接受邮箱、密码和用户名，创建新用户并发送确认邮件
   */
  @Post()
  @Public()
  @Throttle({default: {ttl: oneHour, limit: 60}}) // 每小时每 IP 地址允许 60 次请求
  @ApiOperation({
    summary: 'Create a new user',
    description: 'This endpoint creates a new user by providing an email, password, and username.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully created.',
    type: UserDto,
  })
  async createUser(
    @Body() body: CreateUserBodyDto,
    @ValidateHeader({headerName: 'Accept-Language', options: {expectedValue: AcceptedLanguages}})
    language: AcceptedLanguages,
  ): Promise<UserDto> {
    const {email, password, username} = body;
    const userEntity = await this.usersService.createUser(email, password, username, language);

    return new UserDto(userEntity);
  }

  /**
   * 确认用户注册
   * 使用邮件中的确认码来激活用户账户
   */
  @Post('confirm/:confirmationCode')
  @Public()
  @Throttle({default: {ttl: oneMinute * 15, limit: 10}}) // 15 分钟内每 IP 地址允许 10 次请求
  @ApiOperation({
    summary: 'Confirm user registration',
    description: 'This endpoint confirms a user registration using a confirmation code sent to their email.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully confirmed.',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invalid confirmation code.',
  })
  async confirmUser(@Param() param: ConfirmUserParamDto): Promise<UserDto> {
    const {confirmationCode} = param;
    const userEntity = await this.usersService.confirmUser(confirmationCode);

    return new UserDto(userEntity);
  }

  /**
   * 删除当前用户
   * 删除当前认证用户的账户
   */
  @Delete()
  @ApiOperation({
    summary: 'Delete the current user',
    description: 'This endpoint deletes the currently authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully deleted.',
  })
  async deleteUser(@User() user: ActiveUser): Promise<void> {
    const {userId} = user;
    await this.usersService.deleteUser(userId);
  }

  /**
   * 请求密码重置
   * 使用邮箱地址请求密码重置，系统会发送重置链接到邮箱
   */
  @Post('reset-password/request')
  @Public()
  @Throttle({default: {ttl: oneMinute * 15, limit: 10}}) // 15 分钟内每 IP 地址允许 10 次请求
  @ApiOperation({
    summary: 'Request password reset',
    description: 'This endpoint requests a password reset for the user using their email address.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset request successfully sent.',
  })
  async requestPasswordReset(
    @Body() body: ResetPasswordRequestBodyDto,
    @ValidateHeader({
      headerName: 'Accept-Language',
      options: {
        expectedValue: AcceptedLanguages,
      },
    })
    language: AcceptedLanguages,
  ): Promise<void> {
    const {email} = body;
    await this.usersService.requestPasswordReset(email, language);
  }

  /**
   * 确认密码重置
   * 使用重置令牌和新密码来完成密码重置
   */
  @Post('reset-password/confirm')
  @Public()
  @Throttle({default: {ttl: oneMinute * 15, limit: 3}}) // 15 分钟内每 IP 地址允许 3 次请求
  @ApiOperation({
    summary: 'Confirm password reset',
    description: 'This endpoint confirms the password reset by providing a valid token and new password.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invalid token or password.',
  })
  async confirmPasswordReset(@Body() body: ResetPasswordConfirmBodyDto): Promise<void> {
    const {token, password} = body;
    await this.usersService.confirmPasswordReset(token, password);
  }

  /**
   * 更新当前用户信息
   * 允许当前认证用户更新他们的邮箱、密码或用户名
   */
  @Patch()
  @Throttle({default: {ttl: oneMinute * 15, limit: 10}}) // 15 分钟内每 IP 地址允许 10 次请求
  @ApiOperation({
    summary: 'Update current user details',
    description: 'This endpoint allows the currently authenticated user to update their email, password, or username.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User details successfully updated.',
    type: UserDto,
  })
  async updateUser(@User() user: ActiveUser, @Body() body: UpdateUserBodyDto): Promise<UserDto> {
    const {userId} = user;

    const {email, password, username} = body;
    const userEntity = await this.usersService.updateUser(userId, email, username, password);

    return new UserDto(userEntity);
  }

  /**
   * 获取用户配置状态
   * 返回当前用户的配置状态，包括是否已配置阿里云盘
   */
  @Get('me/config-status')
  @ApiOperation({
    summary: 'Get user configuration status',
    description:
      'This endpoint retrieves the configuration status of the currently authenticated user, including whether they have configured Aliyun Drive.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved user configuration status.',
    schema: {
      type: 'object',
      properties: {
        hasAliyunDriveConfig: {
          type: 'boolean',
          description: 'Whether the user has configured Aliyun Drive',
        },
      },
    },
  })
  async getConfigStatus(@User() user: ActiveUser): Promise<{hasAliyunDriveConfig: boolean}> {
    const {userId} = user;
    const hasConfig = await this.usersService.checkAliyunDriveConfigStatus(userId);
    return {hasAliyunDriveConfig: hasConfig};
  }
}
