/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-restricted-types, @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpException,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {User} from '../auth/decorators/user.decorator';
import {User as UserEntity} from '../users/entities/user.entity';
import {AliyunDriveService} from './aliyun-drive.service';
import {
  CreateAliyunDriveConfigDto,
  UpdateAliyunDriveConfigDto,
  ListFilesDto,
  UploadFileDto,
  DownloadFileDto,
  CreateDirectoryDto,
  DeleteItemsDto,
  MoveItemDto,
  CopyItemDto,
} from './dto/index.js';

@Controller('aliyun-drive')
export class AliyunDriveController {
  constructor(private readonly aliyunDriveService: AliyunDriveService) {}

  // 配置管理端点
  @Post('config')
  @HttpCode(HttpStatus.CREATED)
  async createConfig(
    @User() user: UserEntity,
    @Body() createDto: CreateAliyunDriveConfigDto,
  ): Promise<{
      id: string;
      webdavUrl: string;
      username: string;
      displayName?: string;
      timeout: number;
      basePath?: string;
      isActive: boolean;
      lastSyncAt?: Date;
      createdAt: Date;
      updatedAt: Date;
    }> {
    const config = await this.aliyunDriveService.createConfig(user, createDto);

    return {
      id: config.id,
      webdavUrl: config.webdavUrl,
      username: config.username,
      displayName: config.displayName,
      timeout: config.timeout,
      basePath: config.basePath,
      isActive: config.isActive,
      lastSyncAt: config.lastSyncAt,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  @Get('config')
  async getConfig(@User() user: UserEntity): Promise<{
    id: string;
    webdavUrl: string;
    username: string;
    displayName?: string;
    timeout: number;
    basePath?: string;
    isActive: boolean;
    lastSyncAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    const config = await this.aliyunDriveService.findByUser(user);

    if (!config) {
      return null;
    }

    return {
      id: config.id,
      webdavUrl: config.webdavUrl,
      username: config.username,
      displayName: config.displayName,
      timeout: config.timeout,
      basePath: config.basePath,
      isActive: config.isActive,
      lastSyncAt: config.lastSyncAt,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  @Put('config/:id')
  async updateConfig(
    @Param('id') id: string,
    @User() user: UserEntity,
    @Body() updateDto: UpdateAliyunDriveConfigDto,
  ): Promise<{
      id: string;
      webdavUrl: string;
      username: string;
      displayName?: string;
      timeout: number;
      basePath?: string;
      isActive: boolean;
      lastSyncAt?: Date;
      createdAt: Date;
      updatedAt: Date;
    }> {
    const config = await this.aliyunDriveService.findByUser(user);

    if (!config || config.id !== id) {
      throw new HttpException('Config not found', HttpStatus.NOT_FOUND);
    }

    const updatedConfig = await this.aliyunDriveService.updateConfig(config, updateDto);

    return {
      id: updatedConfig.id,
      webdavUrl: updatedConfig.webdavUrl,
      username: updatedConfig.username,
      displayName: updatedConfig.displayName,
      timeout: updatedConfig.timeout,
      basePath: updatedConfig.basePath,
      isActive: updatedConfig.isActive,
      lastSyncAt: updatedConfig.lastSyncAt,
      createdAt: updatedConfig.createdAt,
      updatedAt: updatedConfig.updatedAt,
    };
  }

  @Delete('config/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConfig(@Param('id') id: string, @User() user: UserEntity): Promise<void> {
    const config = await this.aliyunDriveService.findByUser(user);

    if (!config || config.id !== id) {
      throw new HttpException('Config not found', HttpStatus.NOT_FOUND);
    }

    await this.aliyunDriveService.deleteConfig(config);
  }

  // WebDAV 文件操作端点
  @Get('files')
  async listFiles(@User() user: UserEntity, @Query() listDto: ListFilesDto): Promise<any> {
    const config = await this.aliyunDriveService.findByUser(user);

    if (!config) {
      throw new HttpException('WebDAV config not found', HttpStatus.NOT_FOUND);
    }

    return this.aliyunDriveService.listFiles(config, listDto);
  }

  @Post('files/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @User() user: UserEntity,
    @Body() uploadDto: UploadFileDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const config = await this.aliyunDriveService.findByUser(user);

    if (!config) {
      throw new HttpException('WebDAV config not found', HttpStatus.NOT_FOUND);
    }

    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    // 如果没有提供文件名，使用上传文件的原始名称
    uploadDto.fileName ||= file.originalname;

    return this.aliyunDriveService.uploadFile(config, uploadDto, file.buffer);
  }

  @Get('files/download')
  async downloadFile(
    @User() user: UserEntity,
    @Query() downloadDto: DownloadFileDto,
    @Res() res: Response,
  ): Promise<void> {
    const config = await this.aliyunDriveService.findByUser(user);

    if (!config) {
      throw new HttpException('WebDAV config not found', HttpStatus.NOT_FOUND);
    }

    const {stream, filename, contentType} = await this.aliyunDriveService.downloadFile(config, downloadDto);

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    stream.pipe(res);
  }

  @Post('directories')
  async createDirectory(@User() user: UserEntity, @Body() createDirDto: CreateDirectoryDto): Promise<any> {
    const config = await this.aliyunDriveService.findByUser(user);

    if (!config) {
      throw new HttpException('WebDAV config not found', HttpStatus.NOT_FOUND);
    }

    return this.aliyunDriveService.createDirectory(config, createDirDto);
  }

  @Delete('items')
  async deleteItems(@User() user: UserEntity, @Body() deleteDto: DeleteItemsDto): Promise<any> {
    const config = await this.aliyunDriveService.findByUser(user);

    if (!config) {
      throw new HttpException('WebDAV config not found', HttpStatus.NOT_FOUND);
    }

    return this.aliyunDriveService.deleteItems(config, deleteDto);
  }

  @Post('items/move')
  async moveItem(@User() user: UserEntity, @Body() moveDto: MoveItemDto): Promise<any> {
    const config = await this.aliyunDriveService.findByUser(user);

    if (!config) {
      throw new HttpException('WebDAV config not found', HttpStatus.NOT_FOUND);
    }

    return this.aliyunDriveService.moveItem(config, moveDto);
  }

  @Post('items/copy')
  async copyItem(@User() user: UserEntity, @Body() copyDto: CopyItemDto): Promise<any> {
    const config = await this.aliyunDriveService.findByUser(user);

    if (!config) {
      throw new HttpException('WebDAV config not found', HttpStatus.NOT_FOUND);
    }

    return this.aliyunDriveService.copyItem(config, copyDto);
  }

  @Post('config/:id/sync')
  @HttpCode(HttpStatus.OK)
  async syncConfig(
    @Param('id') id: string,
    @User() user: UserEntity,
  ): Promise<{
      message: string;
      lastSyncAt?: Date;
    }> {
    const config = await this.aliyunDriveService.findByUser(user);

    if (!config || config.id !== id) {
      throw new HttpException('Config not found', HttpStatus.NOT_FOUND);
    }

    await this.aliyunDriveService.updateLastSyncTime(config);

    return {
      message: 'Sync time updated',
      lastSyncAt: config.lastSyncAt,
    };
  }
}
