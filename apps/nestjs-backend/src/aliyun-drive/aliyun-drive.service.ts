import {Injectable, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository} from '@mikro-orm/core';
import {ConfigService} from '@nestjs/config';
import {AliyunDriveConfig} from './entities/aliyun-drive-config.entity';
import {User} from '../users/entities/user.entity';
import {CryptoService} from '../crypto/crypto.service';
import {ConfigKey} from '../config/config-key.enum';
import {
  CreateAliyunDriveConfigDto,
  UpdateAliyunDriveConfigDto,
  ListFilesDto,
  WebDAVFileDto,
  ListFilesResponseDto,
  UploadFileDto,
  DownloadFileDto,
  CreateDirectoryDto,
  DeleteItemsDto,
  MoveItemDto,
  CopyItemDto,
  FileOperationResponseDto,
} from './dto';
import axios, {AxiosInstance} from 'axios';
import * as path from 'path';
import {Readable} from 'stream';

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
    this.defaultTimeout = this.configService.get<number>(ConfigKey.WEBDAV_TIMEOUT) || 30000;
  }

  // 配置管理方法
  async createConfig(user: User, createDto: CreateAliyunDriveConfigDto): Promise<AliyunDriveConfig> {
    const encryptedPassword = this.cryptoService.encrypt(createDto.password);

    const config = this.aliyunDriveConfigRepository.create({
      user,
      webdavUrl: createDto.webdavUrl,
      username: createDto.username,
      encryptedPassword: JSON.stringify(encryptedPassword),
      displayName: createDto.displayName,
      timeout: createDto.timeout || this.defaultTimeout,
      basePath: createDto.basePath || '/',
      isActive: true,
    });

    await this.aliyunDriveConfigRepository.getEntityManager().persistAndFlush(config);
    return config;
  }

  async findByUser(user: User): Promise<AliyunDriveConfig | null> {
    return this.aliyunDriveConfigRepository.findOne({user});
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
    await this.aliyunDriveConfigRepository.persistAndFlush(config);
    return config;
  }

  async getDecryptedPassword(config: AliyunDriveConfig): Promise<string> {
    const encryptedData = JSON.parse(config.encryptedPassword);
    return this.cryptoService.decrypt(encryptedData);
  }

  async deleteConfig(config: AliyunDriveConfig): Promise<void> {
    await this.aliyunDriveConfigRepository.removeAndFlush(config);
  }

  async updateLastSyncTime(config: AliyunDriveConfig): Promise<void> {
    config.lastSyncAt = new Date();
    await this.aliyunDriveConfigRepository.getEntityManager().persistAndFlush(config);
  }

  // WebDAV 客户端方法
  private async createWebDAVClient(config: AliyunDriveConfig): Promise<AxiosInstance> {
    const password = await this.getDecryptedPassword(config);

    return axios.create({
      baseURL: config.webdavUrl,
      timeout: config.timeout,
      auth: {
        username: config.username,
        password: password,
      },
      headers: {
        'Content-Type': 'application/xml',
        'User-Agent': 'Titan-Material-Platform/1.0',
      },
    });
  }

  async listFiles(config: AliyunDriveConfig, listDto: ListFilesDto): Promise<ListFilesResponseDto> {
    try {
      const client = await this.createWebDAVClient(config);
      const targetPath = path.posix.join(config.basePath, listDto.path);

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
          Depth: '1',
          'Content-Type': 'application/xml',
        },
      });

      const files = this.parseWebDAVResponse(response.data, targetPath);

      await this.updateLastSyncTime(config);

      return {
        files,
        path: listDto.path,
        total: files.length,
      };
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`, error.stack);
      throw new HttpException(`Failed to list files: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async uploadFile(
    config: AliyunDriveConfig,
    uploadDto: UploadFileDto,
    fileBuffer: Buffer,
  ): Promise<FileOperationResponseDto> {
    try {
      const client = await this.createWebDAVClient(config);
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
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      return {
        success: false,
        error: `Failed to upload file: ${error.message}`,
      };
    }
  }

  async downloadFile(
    config: AliyunDriveConfig,
    downloadDto: DownloadFileDto,
  ): Promise<{stream: Readable; filename: string; contentType: string}> {
    try {
      const client = await this.createWebDAVClient(config);
      const targetPath = path.posix.join(config.basePath, downloadDto.filePath);

      const response = await client.get(targetPath, {
        responseType: 'stream',
      });

      const filename = downloadDto.downloadName || path.basename(downloadDto.filePath);
      const contentType = response.headers['content-type'] || 'application/octet-stream';

      await this.updateLastSyncTime(config);

      return {
        stream: response.data,
        filename,
        contentType,
      };
    } catch (error) {
      this.logger.error(`Failed to download file: ${error.message}`, error.stack);
      throw new HttpException(`Failed to download file: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async createDirectory(
    config: AliyunDriveConfig,
    createDirDto: CreateDirectoryDto,
  ): Promise<FileOperationResponseDto> {
    try {
      const client = await this.createWebDAVClient(config);
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
      this.logger.error(`Failed to create directory: ${error.message}`, error.stack);
      return {
        success: false,
        error: `Failed to create directory: ${error.message}`,
      };
    }
  }

  async deleteItems(config: AliyunDriveConfig, deleteDto: DeleteItemsDto): Promise<FileOperationResponseDto> {
    try {
      const client = await this.createWebDAVClient(config);
      const results = [];

      for (const itemPath of deleteDto.paths) {
        try {
          const targetPath = path.posix.join(config.basePath, itemPath);
          await client.delete(targetPath);
          results.push(`Deleted: ${itemPath}`);
        } catch (error) {
          results.push(`Failed to delete ${itemPath}: ${error.message}`);
        }
      }

      await this.updateLastSyncTime(config);

      return {
        success: true,
        message: results.join('; '),
      };
    } catch (error) {
      this.logger.error(`Failed to delete items: ${error.message}`, error.stack);
      return {
        success: false,
        error: `Failed to delete items: ${error.message}`,
      };
    }
  }

  async moveItem(config: AliyunDriveConfig, moveDto: MoveItemDto): Promise<FileOperationResponseDto> {
    try {
      const client = await this.createWebDAVClient(config);
      const sourcePath = path.posix.join(config.basePath, moveDto.sourcePath);
      const targetPath = path.posix.join(config.basePath, moveDto.targetPath);

      await client.request({
        method: 'MOVE',
        url: sourcePath,
        headers: {
          Destination: targetPath,
          Overwrite: moveDto.overwrite ? 'T' : 'F',
        },
      });

      await this.updateLastSyncTime(config);

      return {
        success: true,
        message: 'Item moved successfully',
        path: targetPath,
      };
    } catch (error) {
      this.logger.error(`Failed to move item: ${error.message}`, error.stack);
      return {
        success: false,
        error: `Failed to move item: ${error.message}`,
      };
    }
  }

  async copyItem(config: AliyunDriveConfig, copyDto: CopyItemDto): Promise<FileOperationResponseDto> {
    try {
      const client = await this.createWebDAVClient(config);
      const sourcePath = path.posix.join(config.basePath, copyDto.sourcePath);
      const targetPath = path.posix.join(config.basePath, copyDto.targetPath);

      await client.request({
        method: 'COPY',
        url: sourcePath,
        headers: {
          Destination: targetPath,
          Overwrite: copyDto.overwrite ? 'T' : 'F',
        },
      });

      await this.updateLastSyncTime(config);

      return {
        success: true,
        message: 'Item copied successfully',
        path: targetPath,
      };
    } catch (error) {
      this.logger.error(`Failed to copy item: ${error.message}`, error.stack);
      return {
        success: false,
        error: `Failed to copy item: ${error.message}`,
      };
    }
  }

  // WebDAV 响应解析辅助方法
  private parseWebDAVResponse(xmlData: string, basePath: string): WebDAVFileDto[] {
    const files: WebDAVFileDto[] = [];

    try {
      // 这里需要解析 XML 响应，为简化示例，我们使用正则表达式
      // 在实际生产中，建议使用 xml2js 或类似的 XML 解析库
      const responseRegex = /<d:response>(.*?)<\/d:response>/gs;
      const matches = xmlData.match(responseRegex);

      if (!matches) return files;

      matches.forEach((match) => {
        const hrefMatch = match.match(/<d:href>(.*?)<\/d:href>/);
        const displayNameMatch = match.match(/<d:displayname>(.*?)<\/d:displayname>/);
        const contentLengthMatch = match.match(/<d:getcontentlength>(.*?)<\/d:getcontentlength>/);
        const contentTypeMatch = match.match(/<d:getcontenttype>(.*?)<\/d:getcontenttype>/);
        const lastModifiedMatch = match.match(/<d:getlastmodified>(.*?)<\/d:getlastmodified>/);
        const resourceTypeMatch = match.match(/<d:resourcetype>(.*?)<\/d:resourcetype>/);

        if (hrefMatch) {
          const href = decodeURIComponent(hrefMatch[1]);
          const relativePath = href.replace(basePath, '').replace(/^\//, '');

          if (relativePath && relativePath !== '.') {
            const isDirectory = resourceTypeMatch && resourceTypeMatch[1].includes('collection');

            files.push({
              name: displayNameMatch ? displayNameMatch[1] : path.basename(relativePath),
              path: relativePath,
              isDirectory,
              size: contentLengthMatch ? parseInt(contentLengthMatch[1]) : undefined,
              contentType: contentTypeMatch ? contentTypeMatch[1] : undefined,
              lastModified: lastModifiedMatch ? new Date(lastModifiedMatch[1]) : undefined,
            });
          }
        }
      });
    } catch (error) {
      this.logger.error(`Failed to parse WebDAV response: ${error.message}`, error.stack);
    }

    return files;
  }
}
