/* eslint-disable @typescript-eslint/member-ordering */
import * as path from 'node:path';
import {Readable} from 'node:stream';
import {Injectable, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository} from '@mikro-orm/core';
import {ConfigService} from '@nestjs/config';
import axios, {AxiosInstance} from 'axios';
import {ConfigKey} from '../config/config-key.enum';
import {CryptoService, type EncryptedData} from '../crypto/crypto.service';
import {User} from '../users/entities/user.entity';
import {AliyunDriveConfig} from './entities/aliyun-drive-config.entity';
import {
  CreateAliyunDriveConfigDto,
  UpdateAliyunDriveConfigDto,
  ListFilesDto,
  WebDavFileDto,
  ListFilesResponseDto,
  UploadFileDto,
  DownloadFileDto,
  CreateDirectoryDto,
  DeleteItemsDto,
  MoveItemDto,
  CopyItemDto,
  FileOperationResponseDto,
} from './dto/index.js';

@Injectable()
export class AliyunDriveService {
  private readonly logger = new Logger(AliyunDriveService.name);
  private readonly defaultTimeout: number;

  constructor(
    @InjectRepository(AliyunDriveConfig)
    private readonly aliyunDriveConfigRepository: EntityRepository<AliyunDriveConfig>,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {
    this.defaultTimeout = this.configService.get<number>(ConfigKey.WEBDAV_TIMEOUT) ?? 30_000;
  }

  // 配置管理方法
  async createConfig(user: User, createDto: CreateAliyunDriveConfigDto): Promise<AliyunDriveConfig> {
    const encryptedPassword = this.cryptoService.encrypt(createDto.password);

    const config = new AliyunDriveConfig({
      user,
      webdavUrl: createDto.webdavUrl,
      username: createDto.username,
      encryptedPassword: JSON.stringify(encryptedPassword),
      displayName: createDto.displayName,
      timeout: createDto.timeout ?? this.defaultTimeout,
      basePath: createDto.basePath ?? '/',
    });

    await this.aliyunDriveConfigRepository.getEntityManager().persistAndFlush(config);
    return config;
  }

  async findByUser(user: User): Promise<AliyunDriveConfig | undefined> {
    const result = await this.aliyunDriveConfigRepository.findOne({user});
    return result ?? undefined;
  }

  async updateConfig(config: AliyunDriveConfig, updateDto: UpdateAliyunDriveConfigDto): Promise<AliyunDriveConfig> {
    if (updateDto.webdavUrl) config.webdavUrl = updateDto.webdavUrl;
    if (updateDto.username) config.username = updateDto.username;
    if (updateDto.password) {
      config.encryptedPassword = JSON.stringify(this.cryptoService.encrypt(updateDto.password));
    }

    if (updateDto.displayName !== undefined) config.displayName = updateDto.displayName;
    if (updateDto.timeout !== undefined) config.timeout = updateDto.timeout;
    if (updateDto.basePath !== undefined) config.basePath = updateDto.basePath;

    config.lastSyncAt = new Date();
    await this.aliyunDriveConfigRepository.getEntityManager().persistAndFlush(config);
    return config;
  }

  async getDecryptedPassword(config: AliyunDriveConfig): Promise<string> {
    try {
      const encryptedData = JSON.parse(config.encryptedPassword) as EncryptedData;
      return this.cryptoService.decrypt(encryptedData);
    } catch (error) {
      this.logger.error(
        `Failed to decrypt password: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new HttpException('Failed to decrypt password', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteConfig(config: AliyunDriveConfig): Promise<void> {
    await this.aliyunDriveConfigRepository.getEntityManager().removeAndFlush(config);
  }

  async updateLastSyncTime(config: AliyunDriveConfig): Promise<void> {
    config.lastSyncAt = new Date();
    await this.aliyunDriveConfigRepository.getEntityManager().persistAndFlush(config);
  }

  // WebDAV 客户端方法
  private async createWebDavClient(config: AliyunDriveConfig): Promise<AxiosInstance> {
    const password = await this.getDecryptedPassword(config);

    return axios.create({
      baseUrl: config.webdavUrl,
      timeout: config.timeout,
      auth: {
        username: config.username,
        password,
      },
      headers: {
        'Content-Type': 'application/xml',
        'User-Agent': 'Titan-Material-Platform/1.0',
      },
    });
  }

  async listFiles(config: AliyunDriveConfig, listDto: ListFilesDto): Promise<ListFilesResponseDto> {
    try {
      const client = await this.createWebDavClient(config);
      const targetPath = path.posix.join(config.basePath ?? '/', listDto.path ?? '/');

      const propfindBody = `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:displayname/>
    <d:getcontentlength/>
    <d:getcontenttype/>
    <d:getlastmodified/>
    <d:creationdate/>
    <d:resourcetype/>
  </d:prop>
</d:propfind>`;

      const response = await client.request({
        method: 'PROPFIND',
        url: targetPath,
        data: propfindBody,
        headers: {
          depth: '1',
          'Content-Type': 'application/xml',
        },
      });

      const files = this.parseWebDavResponse(response.data as string, targetPath);

      await this.updateLastSyncTime(config);

      return {
        files,
        path: listDto.path ?? '/',
        total: files.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new HttpException(
        `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadFile(
    config: AliyunDriveConfig,
    uploadDto: UploadFileDto,
    fileBuffer: Uint8Array,
  ): Promise<FileOperationResponseDto> {
    try {
      const client = await this.createWebDavClient(config);
      const targetPath = path.posix.join(config.basePath, uploadDto.path, uploadDto.fileName);

      await client.put(targetPath, fileBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      await this.updateLastSyncTime(config);

      return {
        success: true,
        message: 'File uploaded successfully',
        path: targetPath,
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      return {
        success: false,
        error: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async downloadFile(
    config: AliyunDriveConfig,
    downloadDto: DownloadFileDto,
  ): Promise<{stream: Readable; filename: string; contentType: string}> {
    try {
      const client = await this.createWebDavClient(config);
      const targetPath = path.posix.join(config.basePath, downloadDto.filePath);

      const response = await client.get(targetPath, {
        responseType: 'stream',
      });

      const filename = downloadDto.downloadName ?? path.basename(downloadDto.filePath);
      const contentType = (response.headers['content-type'] as string) ?? 'application/octet-stream';

      await this.updateLastSyncTime(config);

      return {
        stream: response.data as Readable,
        filename,
        contentType,
      };
    } catch (error) {
      this.logger.error(
        `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new HttpException(
        `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createDirectory(
    config: AliyunDriveConfig,
    createDirDto: CreateDirectoryDto,
  ): Promise<FileOperationResponseDto> {
    try {
      const client = await this.createWebDavClient(config);
      const targetPath = path.posix.join(config.basePath, createDirDto.path, createDirDto.directoryName);

      await client.request({
        method: 'MKCOL',
        url: targetPath,
      });

      await this.updateLastSyncTime(config);

      return {
        success: true,
        message: 'Directory created successfully',
        path: targetPath,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      return {
        success: false,
        error: `Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async deleteItems(config: AliyunDriveConfig, deleteDto: DeleteItemsDto): Promise<FileOperationResponseDto> {
    try {
      const client = await this.createWebDavClient(config);

      const deletePromises = deleteDto.paths.map(async (itemPath) => {
        try {
          const targetPath = path.posix.join(config.basePath, itemPath);
          await client.delete(targetPath);
          return `Deleted: ${itemPath}`;
        } catch (error) {
          return `Failed to delete ${itemPath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      });

      const results = await Promise.all(deletePromises);

      await this.updateLastSyncTime(config);

      return {
        success: true,
        message: results.join('; '),
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete items: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      return {
        success: false,
        error: `Failed to delete items: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async moveItem(config: AliyunDriveConfig, moveDto: MoveItemDto): Promise<FileOperationResponseDto> {
    try {
      const client = await this.createWebDavClient(config);
      const sourcePath = path.posix.join(config.basePath, moveDto.sourcePath);
      const targetPath = path.posix.join(config.basePath, moveDto.targetPath);

      await client.request({
        method: 'MOVE',
        url: sourcePath,
        headers: {
          destination: targetPath,
          overwrite: moveDto.overwrite ? 'T' : 'F',
        },
      });

      await this.updateLastSyncTime(config);

      return {
        success: true,
        message: 'Item moved successfully',
        path: targetPath,
      };
    } catch (error) {
      this.logger.error(
        `Failed to move item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      return {
        success: false,
        error: `Failed to move item: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async copyItem(config: AliyunDriveConfig, copyDto: CopyItemDto): Promise<FileOperationResponseDto> {
    try {
      const client = await this.createWebDavClient(config);
      const sourcePath = path.posix.join(config.basePath, copyDto.sourcePath);
      const targetPath = path.posix.join(config.basePath, copyDto.targetPath);

      await client.request({
        method: 'COPY',
        url: sourcePath,
        headers: {
          destination: targetPath,
          overwrite: copyDto.overwrite ? 'T' : 'F',
        },
      });

      await this.updateLastSyncTime(config);

      return {
        success: true,
        message: 'Item copied successfully',
        path: targetPath,
      };
    } catch (error) {
      this.logger.error(
        `Failed to copy item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      return {
        success: false,
        error: `Failed to copy item: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // WebDAV 响应解析辅助方法
  private parseWebDavResponse(xmlData: string, basePath: string): WebDavFileDto[] {
    const files: WebDavFileDto[] = [];

    try {
      // 这里需要解析 XML 响应，为简化示例，我们使用正则表达式
      // 在实际生产中，建议使用 xml2js 或类似的 XML 解析库
      const responseRegex = /<d:response>(.*?)<\/d:response>/gs;
      const matches = xmlData.match(responseRegex);

      if (!matches) return files;

      for (const match of matches) {
        const hrefMatch = /<d:href>(.*?)<\/d:href>/.exec(match);
        const displayNameMatch = /<d:displayname>(.*?)<\/d:displayname>/.exec(match);
        const contentLengthMatch = /<d:getcontentlength>(.*?)<\/d:getcontentlength>/.exec(match);
        const contentTypeMatch = /<d:getcontenttype>(.*?)<\/d:getcontenttype>/.exec(match);
        const lastModifiedMatch = /<d:getlastmodified>(.*?)<\/d:getlastmodified>/.exec(match);
        const resourceTypeMatch = /<d:resourcetype>(.*?)<\/d:resourcetype>/.exec(match);

        if (hrefMatch) {
          const href = decodeURIComponent(hrefMatch[1]);
          const relativePath = href.replace(basePath, '').replace(/^\//, '');

          if (relativePath && relativePath !== '.') {
            const isDirectory = Boolean(resourceTypeMatch?.[1]?.includes('collection'));

            files.push({
              name: displayNameMatch ? displayNameMatch[1] : path.basename(relativePath),
              path: relativePath,
              isDirectory,
              size: contentLengthMatch ? Number.parseInt(contentLengthMatch[1], 10) : undefined,
              contentType: contentTypeMatch ? contentTypeMatch[1] : undefined,
              lastModified: lastModifiedMatch ? new Date(lastModifiedMatch[1]) : undefined,
            });
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to parse WebDAV response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
    }

    return files;
  }
}
