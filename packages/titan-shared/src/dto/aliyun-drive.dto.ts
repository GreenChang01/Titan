import {IsString, IsOptional, IsNumber, IsUUID, IsDateString, IsBoolean} from 'class-validator';

/**
 * 阿里云盘配置数据传输对象
 *
 * 用于返回完整的阿里云盘WebDAV配置信息，包含所有字段和元数据
 * 密码字段已加密处理，不在此DTO中暴露
 *
 * @example
 * ```typescript
 * const config: AliyunDriveConfigDto = {
 *   id: "uuid-v4",
 *   webdavUrl: "https://webdav.aliyundrive.com/dav",
 *   username: "user@example.com",
 *   displayName: "我的阿里云盘",
 *   timeout: 30000,
 *   basePath: "/素材库",
 *   lastSyncAt: "2025-01-01T00:00:00.000Z",
 *   isActive: true,
 *   createdAt: "2025-01-01T00:00:00.000Z",
 *   updatedAt: "2025-01-01T00:00:00.000Z"
 * };
 * ```
 */
export class AliyunDriveConfigDto {
	/** 配置唯一标识符，UUID格式 */
	@IsUUID()
	id: string;

	/** WebDAV服务器地址，通常为阿里云盘官方WebDAV端点 */
	@IsString()
	webdavUrl: string;

	/** 阿里云盘用户名，通常为邮箱地址 */
	@IsString()
	username: string;

	/** 配置显示名称，用于用户界面展示，可选 */
	@IsOptional()
	@IsString()
	displayName?: string;

	/** WebDAV连接超时时间，单位毫秒，建议30000ms */
	@IsNumber()
	timeout: number;

	/** WebDAV根路径，指定访问的起始目录 */
	@IsString()
	basePath: string;

	/** 最后同步时间，ISO字符串格式，可选 */
	@IsOptional()
	@IsDateString()
	lastSyncAt?: string;

	/** 配置是否处于激活状态 */
	@IsBoolean()
	isActive: boolean;

	/** 配置创建时间，ISO字符串格式 */
	@IsDateString()
	createdAt: string;

	/** 配置最后更新时间，ISO字符串格式 */
	@IsDateString()
	updatedAt: string;
}

/**
 * 创建阿里云盘配置请求对象
 *
 * 用于初次配置阿里云盘WebDAV连接的数据传输对象
 * 包含连接所需的基本信息，密码字段将在后端加密存储
 *
 * @example
 * ```typescript
 * const createConfig: CreateAliyunDriveConfigDto = {
 *   webdavUrl: "https://webdav.aliyundrive.com/dav",
 *   username: "user@example.com",
 *   password: "user_password",
 *   displayName: "我的阿里云盘",
 *   timeout: 30000,
 *   basePath: "/素材库"
 * };
 * ```
 */
export class CreateAliyunDriveConfigDto {
	/** WebDAV服务器地址，必须为有效的URL */
	@IsString()
	webdavUrl: string;

	/** 阿里云盘用户名，通常为注册邮箱 */
	@IsString()
	username: string;

	/** 阿里云盘密码，将在后端加密存储 */
	@IsString()
	password: string;

	/** 配置显示名称，用于用户界面展示，可选 */
	@IsOptional()
	@IsString()
	displayName?: string;

	/** WebDAV连接超时时间，单位毫秒，可选，默认30000ms */
	@IsOptional()
	@IsNumber()
	timeout?: number;

	/** WebDAV根路径，指定访问的起始目录，可选，默认为根目录 */
	@IsOptional()
	@IsString()
	basePath?: string;
}

/**
 * 更新阿里云盘配置请求对象
 *
 * 用于修改现有阿里云盘WebDAV配置的数据传输对象
 * 所有字段都是可选的，只更新提供的字段
 *
 * @example
 * ```typescript
 * const updateConfig: UpdateAliyunDriveConfigDto = {
 *   displayName: "更新后的名称",
 *   timeout: 60000,
 *   basePath: "/新的路径"
 * };
 * ```
 */
export class UpdateAliyunDriveConfigDto {
	/** WebDAV服务器地址，可选更新 */
	@IsOptional()
	@IsString()
	webdavUrl?: string;

	/** 阿里云盘用户名，可选更新 */
	@IsOptional()
	@IsString()
	username?: string;

	/** 阿里云盘密码，可选更新，将重新加密存储 */
	@IsOptional()
	@IsString()
	password?: string;

	/** 配置显示名称，可选更新 */
	@IsOptional()
	@IsString()
	displayName?: string;

	/** WebDAV连接超时时间，可选更新 */
	@IsOptional()
	@IsNumber()
	timeout?: number;

	/** WebDAV根路径，可选更新 */
	@IsOptional()
	@IsString()
	basePath?: string;
}

/**
 * WebDAV文件信息对象
 *
 * 表示从阿里云盘WebDAV接口获取的文件或目录信息
 * 包含文件的基本属性和元数据
 *
 * @example
 * ```typescript
 * const file: WebDavFileDto = {
 *   name: "example.jpg",
 *   path: "/photos/example.jpg",
 *   isDirectory: false,
 *   size: 1024000,
 *   contentType: "image/jpeg",
 *   lastModified: "2025-01-01T00:00:00.000Z"
 * };
 * ```
 */
export class WebDavFileDto {
	/** 文件或目录名称 */
	@IsString()
	name: string;

	/** 文件或目录的完整路径 */
	@IsString()
	path: string;

	/** 是否为目录 */
	@IsBoolean()
	isDirectory: boolean;

	/** 文件大小，字节数，目录时为空 */
	@IsOptional()
	@IsNumber()
	size?: number;

	/** 文件MIME类型，目录时为空 */
	@IsOptional()
	@IsString()
	contentType?: string;

	/** 文件最后修改时间，ISO字符串格式，可选 */
	@IsOptional()
	@IsDateString()
	lastModified?: string;
}

/**
 * 列出文件请求对象
 *
 * 用于指定要列出的目录路径的请求参数
 *
 * @example
 * ```typescript
 * const listRequest: ListFilesDto = {
 *   path: "/素材库/图片"
 * };
 * ```
 */
export class ListFilesDto {
	/** 要列出文件的目录路径，可选，默认为根目录 */
	@IsOptional()
	@IsString()
	path?: string;
}

/**
 * 列出文件响应对象
 *
 * WebDAV文件列表API的返回结果，包含文件列表和路径信息
 *
 * @example
 * ```typescript
 * const response: ListFilesResponseDto = {
 *   path: "/素材库",
 *   total: 25,
 *   files: [...]
 * };
 * ```
 */
export class ListFilesResponseDto {
	/** 当前列出的目录路径 */
	@IsString()
	path: string;

	/** 文件和目录总数 */
	@IsNumber()
	total: number;

	/** 文件和目录列表 */
	files: WebDavFileDto[];
}
