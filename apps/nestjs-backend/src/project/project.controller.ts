/* eslint-disable @typescript-eslint/no-explicit-any */
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
@ApiTags('projects')
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
    summary: 'Create new project',
    description: 'Create a new project for the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project created successfully'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data'
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
    summary: 'Get all user projects',
    description: 'Get all active projects owned by the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Projects retrieved successfully'
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
    summary: 'Get project by ID',
    description: 'Get project details and update last accessed time'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project retrieved successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found or access denied'
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
    summary: 'Update project',
    description: 'Update project name, description, or color'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project updated successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found or access denied'
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
    summary: 'Delete project',
    description: 'Soft delete project (set to inactive)'
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Project deleted successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found or access denied'
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
