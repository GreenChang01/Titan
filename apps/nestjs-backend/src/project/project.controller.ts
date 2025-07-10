import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import {ProjectService} from './project.service';
import {User} from '../auth/decorators/user.decorator';
import {User as UserEntity} from '../users/entities/user.entity';
import {CreateProjectDto} from './dto/create-project.dto';
import {UpdateProjectDto} from './dto/update-project.dto';
import {AddMaterialDto} from './dto/add-material.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@User() user: UserEntity, @Body() createDto: CreateProjectDto) {
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

  @Get()
  async findAll(@User() user: UserEntity) {
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

  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: UserEntity) {
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

  @Patch(':id')
  async update(@Param('id') id: string, @User() user: UserEntity, @Body() updateDto: UpdateProjectDto) {
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @User() user: UserEntity) {
    const project = await this.projectService.validateProjectOwnership(id, user);
    await this.projectService.delete(project);
  }

  // 素材管理端点
  @Post(':id/materials')
  @HttpCode(HttpStatus.CREATED)
  async addMaterial(@Param('id') projectId: string, @User() user: UserEntity, @Body() addMaterialDto: AddMaterialDto) {
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

  @Delete(':id/materials/:materialId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMaterial(
    @Param('id') projectId: string,
    @Param('materialId') materialId: string,
    @User() user: UserEntity,
  ) {
    const project = await this.projectService.validateProjectOwnership(projectId, user);
    await this.projectService.removeMaterial(project, materialId);
  }

  @Get(':id/materials')
  async getProjectMaterials(@Param('id') projectId: string, @User() user: UserEntity) {
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
