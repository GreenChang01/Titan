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
@ApiTags('用户管理')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 获取当前用户信息
   * 返回当前认证用户的详细信息
   */
  @Get('me')
  @ApiOperation({
    summary: '获取当前用户信息',
    description: '获取当前认证用户的详细信息，包括用户名、邮箱、状态等',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功获取用户信息',
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
    summary: '创建新用户',
    description: '通过提供邮箱、密码和用户名创建新用户账户，系统将发送确认邮件',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '用户创建成功',
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
    summary: '确认用户注册',
    description: '使用邮件中的确认码激活用户账户，完成注册流程',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户账户确认成功',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '无效的确认码',
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
    summary: '删除当前用户',
    description: '删除当前认证用户的账户，此操作不可恢复',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户删除成功',
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
    summary: '请求密码重置',
    description: '使用邮箱地址请求密码重置，系统将发送重置链接到指定邮箱',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '密码重置请求发送成功',
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
    summary: '确认密码重置',
    description: '使用重置令牌和新密码完成密码重置操作',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '密码重置成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '无效的重置令牌或密码格式错误',
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
    summary: '更新当前用户信息',
    description: '允许当前认证用户更新他们的邮箱、密码或用户名',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息更新成功',
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
    summary: '获取用户配置状态',
    description: '获取当前用户的配置状态，包括是否已配置阿里云盘等外部服务',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功获取用户配置状态',
    schema: {
      type: 'object',
      properties: {
        hasAliyunDriveConfig: {
          type: 'boolean',
          description: '用户是否已配置阿里云盘',
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
