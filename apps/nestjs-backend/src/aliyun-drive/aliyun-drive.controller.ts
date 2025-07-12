/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-restricted-types, import-x/no-unassigned-import */
import 'multer';
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
import {ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery} from '@nestjs/swagger';
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

@ApiTags('aliyun-drive')
@Controller('aliyun-drive')
export class AliyunDriveController {
  constructor(private readonly aliyunDriveService: AliyunDriveService) {}

  // 配置管理端点
  @Post('config')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create WebDAV configuration',
    description: 'Create a new WebDAV configuration for the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Configuration created successfully'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated'
  })
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
  @ApiOperation({
    summary: 'Get WebDAV configuration',
    description: 'Get the WebDAV configuration for the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration retrieved successfully'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated'
  })
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
  @ApiOperation({
    summary: 'List files in WebDAV directory',
    description: 'List files and directories with pagination and search support for large directories'
  })
  @ApiQuery({
    name: 'path',
    description: 'Directory path to list files from',
    required: false,
    example: '/'
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of files to return (1-1000)',
    required: false,
    example: 100
  })
  @ApiQuery({
    name: 'offset',
    description: 'Number of files to skip for pagination',
    required: false,
    example: 0
  })
  @ApiQuery({
    name: 'search',
    description: 'Search term to filter files by name',
    required: false,
    example: 'photo'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File list with pagination info',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'document.pdf' },
              path: { type: 'string', example: '/documents/document.pdf' },
              isDirectory: { type: 'boolean', example: false },
              size: { type: 'number', example: 1024768 },
              contentType: { type: 'string', example: 'application/pdf' },
              lastModified: { type: 'string', format: 'date-time' }
            }
          }
        },
        total: { type: 'number', example: 250 },
        path: { type: 'string', example: '/' },
        limit: { type: 'number', example: 100 },
        offset: { type: 'number', example: 0 },
        hasMore: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'WebDAV config not found'
  })
  async listFiles(@User() user: UserEntity, @Query() listDto: ListFilesDto): Promise<any> {
    const config = await this.aliyunDriveService.findByUser(user);

    if (!config) {
      throw new HttpException('WebDAV config not found', HttpStatus.NOT_FOUND);
    }

    return this.aliyunDriveService.listFiles(config, listDto);
  }

  @Post('files/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload file to WebDAV',
    description: 'Upload a file to the configured WebDAV server'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload with metadata',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        path: {
          type: 'string',
          description: 'Upload path',
        },
        fileName: {
          type: 'string',
          description: 'Optional custom filename',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File uploaded successfully'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or missing data'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'WebDAV configuration not found'
  })
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
