import {IsString, IsOptional, IsDateString, IsUUID, IsBoolean} from 'class-validator';

/**
 * 项目数据传输对象
 *
 * 用于在前后端之间传输项目完整信息的标准化数据结构
 * 包含项目的所有基本属性和元数据信息
 *
 * @example
 * ```typescript
 * const project: ProjectDto = {
 *   id: 'proj-123',
 *   name: '我的ASMR项目',
 *   description: '放松音频项目',
 *   color: '#3B82F6',
 *   isActive: true,
 *   createdAt: '2023-01-01T00:00:00Z',
 *   updatedAt: '2023-01-02T00:00:00Z',
 *   lastAccessedAt: '2023-01-02T12:00:00Z'
 * };
 * ```
 */
export class ProjectDto {
	/** 项目唯一标识符（UUID格式） */
	@IsUUID()
	id: string;

	/** 项目名称 */
	@IsString()
	name: string;

	/** 项目描述（可选） */
	@IsOptional()
	@IsString()
	description?: string;

	/** 项目颜色标识（可选，十六进制颜色值） */
	@IsOptional()
	@IsString()
	color?: string;

	/** 项目是否处于激活状态 */
	@IsBoolean()
	isActive: boolean;

	/** 项目最后访问时间（可选，ISO 8601格式） */
	@IsOptional()
	@IsDateString()
	lastAccessedAt?: string;

	/** 项目创建时间（ISO 8601格式） */
	@IsDateString()
	createdAt: string;

	/** 项目最后更新时间（ISO 8601格式） */
	@IsDateString()
	updatedAt: string;
}

/**
 * 创建项目请求数据传输对象
 *
 * 用于创建新项目时的数据验证和传输
 * 只包含创建项目所需的必要字段
 *
 * @example
 * ```typescript
 * const createRequest: CreateProjectDto = {
 *   name: '新ASMR项目',
 *   description: '帮助睡眠的音频项目',
 *   color: '#FF5722'
 * };
 * ```
 */
export class CreateProjectDto {
	/** 项目名称（必填） */
	@IsString()
	name: string;

	/** 项目描述（可选） */
	@IsOptional()
	@IsString()
	description?: string;

	/** 项目颜色标识（可选，十六进制颜色值，默认为蓝色） */
	@IsOptional()
	@IsString()
	color?: string;
}

/**
 * 更新项目请求数据传输对象
 *
 * 用于更新现有项目时的数据验证和传输
 * 所有字段都是可选的，支持部分更新
 *
 * @example
 * ```typescript
 * const updateRequest: UpdateProjectDto = {
 *   name: '更新后的项目名称',
 *   color: '#4CAF50'
 *   // description 保持不变
 * };
 * ```
 */
export class UpdateProjectDto {
	/** 项目名称（可选） */
	@IsOptional()
	@IsString()
	name?: string;

	/** 项目描述（可选） */
	@IsOptional()
	@IsString()
	description?: string;

	/** 项目颜色标识（可选，十六进制颜色值） */
	@IsOptional()
	@IsString()
	color?: string;
}
