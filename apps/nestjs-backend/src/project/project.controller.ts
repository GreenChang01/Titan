import {Controller, Get, Post, Delete, Body, Param, HttpStatus, HttpCode, Patch} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse} from '@nestjs/swagger';
import {User} from '../auth/decorators/user.decorator';
import {User as UserEntity} from '../users/entities/user.entity';
import {ProjectService} from './project.service';
import {CreateProjectDto} from './dto/create-project.dto';
import {UpdateProjectDto} from './dto/update-project.dto';
import {AddMaterialDto} from './dto/add-material.dto';

/**
 * 项目控制器
 * 处理项目相关的 API 端点，包括项目的 CRUD 操作和项目素材管理
 */
@ApiTags('项目管理')
@Controller('projects')
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	/**
	 * 创建新项目
	 * 接受项目名称、描述和颜色，创建新的项目
	 */
	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: '创建新项目',
		description: '为当前用户创建一个新的内容项目，用于组织和管理ASMR内容生产相关的资源',
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: '项目创建成功',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: '输入数据验证失败',
	})
	async create(
		@User() user: UserEntity,
		@Body() createDto: CreateProjectDto,
	): Promise<{
		id: string;
		name: string;
		description?: string;
		color?: string;
		isActive: boolean;
		lastAccessedAt?: Date;
		createdAt: Date;
		updatedAt: Date;
	}> {
		const project = await this.projectService.create(user, createDto.name, createDto.description, createDto.color);

		return {
			id: project.id,
			name: project.name,
			description: project.description,
			color: project.color,
			isActive: project.isActive,
			lastAccessedAt: project.lastAccessedAt,
			createdAt: project.createdAt,
			updatedAt: project.updatedAt,
		};
	}

	/**
	 * 获取当前用户的所有项目
	 * 返回用户拥有的所有激活项目列表
	 */
	@Get()
	@ApiOperation({
		summary: '获取用户所有项目',
		description: '获取当前用户拥有的所有激活项目列表',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '项目列表获取成功',
	})
	async findAll(@User() user: UserEntity): Promise<
		Array<{
			id: string;
			name: string;
			description?: string;
			color?: string;
			isActive: boolean;
			lastAccessedAt?: Date;
			createdAt: Date;
			updatedAt: Date;
		}>
	> {
		const projects = await this.projectService.findAllByUser(user);

		return projects.map((project) => ({
			id: project.id,
			name: project.name,
			description: project.description,
			color: project.color,
			isActive: project.isActive,
			lastAccessedAt: project.lastAccessedAt,
			createdAt: project.createdAt,
			updatedAt: project.updatedAt,
		}));
	}

	/**
	 * 根据ID获取单个项目
	 * 验证用户权限后返回项目详情，并更新最后访问时间
	 */
	@Get(':id')
	@ApiOperation({
		summary: '根据ID获取项目详情',
		description: '获取指定项目的详细信息并更新最后访问时间',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '项目详情获取成功',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: '项目不存在或无访问权限',
	})
	async findOne(
		@Param('id') id: string,
		@User() user: UserEntity,
	): Promise<{
		id: string;
		name: string;
		description?: string;
		color?: string;
		isActive: boolean;
		lastAccessedAt?: Date;
		createdAt: Date;
		updatedAt: Date;
	}> {
		const project = await this.projectService.validateProjectOwnership(id, user);

		// 更新最后访问时间
		await this.projectService.updateLastAccessed(project);

		return {
			id: project.id,
			name: project.name,
			description: project.description,
			color: project.color,
			isActive: project.isActive,
			lastAccessedAt: project.lastAccessedAt,
			createdAt: project.createdAt,
			updatedAt: project.updatedAt,
		};
	}

	/**
	 * 更新项目信息
	 * 验证用户权限后更新项目的名称、描述或颜色
	 */
	@Patch(':id')
	@ApiOperation({
		summary: '更新项目信息',
		description: '更新项目的名称、描述或颜色标识',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '项目更新成功',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: '项目不存在或无访问权限',
	})
	async update(
		@Param('id') id: string,
		@User() user: UserEntity,
		@Body() updateDto: UpdateProjectDto,
	): Promise<{
		id: string;
		name: string;
		description?: string;
		color?: string;
		isActive: boolean;
		lastAccessedAt?: Date;
		createdAt: Date;
		updatedAt: Date;
	}> {
		const project = await this.projectService.validateProjectOwnership(id, user);

		const updatedProject = await this.projectService.update(
			project,
			updateDto.name,
			updateDto.description,
			updateDto.color,
		);

		return {
			id: updatedProject.id,
			name: updatedProject.name,
			description: updatedProject.description,
			color: updatedProject.color,
			isActive: updatedProject.isActive,
			lastAccessedAt: updatedProject.lastAccessedAt,
			createdAt: updatedProject.createdAt,
			updatedAt: updatedProject.updatedAt,
		};
	}

	/**
	 * 删除项目
	 * 验证用户权限后软删除项目（设置为非激活状态）
	 */
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: '删除项目',
		description: '软删除项目（设置为非激活状态）',
	})
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: '项目删除成功',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: '项目不存在或无访问权限',
	})
	async delete(@Param('id') id: string, @User() user: UserEntity): Promise<void> {
		const project = await this.projectService.validateProjectOwnership(id, user);
		await this.projectService.delete(project);
	}

	/**
	 * 向项目添加素材
	 * 验证用户权限后向项目中添加新的素材文件
	 */
	@Post(':id/materials')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: '向项目添加素材',
		description: '向指定项目中添加素材文件，支持从阿里云盘或本地上传的资源中选择',
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: '素材添加成功',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: '项目不存在或无访问权限',
	})
	async addMaterial(
		@Param('id') projectId: string,
		@User() user: UserEntity,
		@Body() addMaterialDto: AddMaterialDto,
	): Promise<{
		id: string;
		aliyunFileId: string;
		fileName: string;
		filePath: string;
		fileType?: string;
		fileSize?: number;
		thumbnailUrl?: string;
		fileCreatedAt?: Date;
		fileUpdatedAt?: Date;
		description?: string;
		metadata?: Record<string, any>;
		createdAt: Date;
		updatedAt: Date;
	}> {
		const project = await this.projectService.validateProjectOwnership(projectId, user);

		const material = await this.projectService.addMaterial(project, addMaterialDto);

		return {
			id: material.id,
			aliyunFileId: material.aliyunFileId,
			fileName: material.fileName,
			filePath: material.filePath,
			fileType: material.fileType,
			fileSize: material.fileSize,
			thumbnailUrl: material.thumbnailUrl,
			fileCreatedAt: material.fileCreatedAt,
			fileUpdatedAt: material.fileUpdatedAt,
			description: material.description,
			metadata: material.metadata,
			createdAt: material.createdAt,
			updatedAt: material.updatedAt,
		};
	}

	/**
	 * 从项目中移除素材
	 * 验证用户权限后从项目中移除指定的素材
	 */
	@Delete(':id/materials/:materialId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: '从项目中移除素材',
		description: '从指定项目中移除素材文件，仅移除关联关系，不删除原始文件',
	})
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: '素材移除成功',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: '项目或素材不存在',
	})
	async removeMaterial(
		@Param('id') projectId: string,
		@Param('materialId') materialId: string,
		@User() user: UserEntity,
	): Promise<void> {
		const project = await this.projectService.validateProjectOwnership(projectId, user);
		await this.projectService.removeMaterial(project, materialId);
	}

	/**
	 * 获取项目的所有素材
	 * 验证用户权限后返回项目包含的所有素材列表
	 */
	@Get(':id/materials')
	@ApiOperation({
		summary: '获取项目素材列表',
		description: '获取指定项目中的所有素材文件，包括文件信息、缩略图等',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: '项目素材列表获取成功',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: '项目不存在或无访问权限',
	})
	async getProjectMaterials(
		@Param('id') projectId: string,
		@User() user: UserEntity,
	): Promise<
		Array<{
			id: string;
			aliyunFileId: string;
			fileName: string;
			filePath: string;
			fileType?: string;
			fileSize?: number;
			thumbnailUrl?: string;
			fileCreatedAt?: Date;
			fileUpdatedAt?: Date;
			description?: string;
			metadata?: Record<string, any>;
			createdAt: Date;
			updatedAt: Date;
		}>
	> {
		const project = await this.projectService.validateProjectOwnership(projectId, user);
		const materials = await this.projectService.findProjectMaterials(project);

		return materials.map((material) => ({
			id: material.id,
			aliyunFileId: material.aliyunFileId,
			fileName: material.fileName,
			filePath: material.filePath,
			fileType: material.fileType,
			fileSize: material.fileSize,
			thumbnailUrl: material.thumbnailUrl,
			fileCreatedAt: material.fileCreatedAt,
			fileUpdatedAt: material.fileUpdatedAt,
			description: material.description,
			metadata: material.metadata,
			createdAt: material.createdAt,
			updatedAt: material.updatedAt,
		}));
	}
}
