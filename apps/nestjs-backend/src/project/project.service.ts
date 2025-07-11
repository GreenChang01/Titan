import {Injectable, NotFoundException, ConflictException} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository, EntityManager} from '@mikro-orm/core';
import {ProjectMaterial} from '../project-material/entities/project-material.entity';
import {User} from '../users/entities/user.entity';
import {Project} from './entities/project.entity';
import {AddMaterialDto} from './dto/add-material.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: EntityRepository<Project>,
    @InjectRepository(ProjectMaterial)
    private readonly projectMaterialRepository: EntityRepository<ProjectMaterial>,
    private readonly em: EntityManager,
  ) {}

  async create(user: User, name: string, description?: string, color?: string): Promise<Project> {
    const project = new Project({
      user,
      name,
      description,
      color: color ?? '#3B82F6',
    });

    await this.em.persistAndFlush(project);
    return project;
  }

  async findAllByUser(user: User): Promise<Project[]> {
    return this.projectRepository.find(
      {user, isActive: true},
      {
        orderBy: {lastAccessedAt: 'DESC', createdAt: 'DESC'},
        populate: ['materials'],
      },
    );
  }

  async findById(id: string, user: User): Promise<Project | undefined> {
    const result = await this.projectRepository.findOne({id, user}, {populate: ['materials']});
    return result ?? undefined;
  }

  async update(project: Project, name?: string, description?: string, color?: string): Promise<Project> {
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;

    await this.em.persistAndFlush(project);
    return project;
  }

  async updateLastAccessed(project: Project): Promise<void> {
    project.lastAccessedAt = new Date();
    await this.em.persistAndFlush(project);
  }

  async delete(project: Project): Promise<void> {
    project.isActive = false;
    await this.em.persistAndFlush(project);
  }

  async hardDelete(project: Project): Promise<void> {
    await this.em.removeAndFlush(project);
  }

  // 素材管理方法
  async addMaterial(project: Project, addMaterialDto: AddMaterialDto): Promise<ProjectMaterial> {
    // 检查素材是否已经存在于该项目中
    const existingMaterial = await this.projectMaterialRepository.findOne({
      project,
      aliyunFileId: addMaterialDto.aliyunFileId,
      isActive: true,
    });

    if (existingMaterial) {
      throw new ConflictException('This material is already added to the project');
    }

    const material = new ProjectMaterial({
      project,
      aliyunFileId: addMaterialDto.aliyunFileId,
      fileName: addMaterialDto.fileName,
      filePath: addMaterialDto.filePath,
      fileType: addMaterialDto.fileType,
      fileSize: addMaterialDto.fileSize,
      thumbnailUrl: addMaterialDto.thumbnailUrl,
      fileCreatedAt: addMaterialDto.fileCreatedAt ? new Date(addMaterialDto.fileCreatedAt) : undefined,
      fileUpdatedAt: addMaterialDto.fileUpdatedAt ? new Date(addMaterialDto.fileUpdatedAt) : undefined,
      description: addMaterialDto.description,
      metadata: addMaterialDto.metadata,
    });

    await this.em.persistAndFlush(material);
    return material;
  }

  async removeMaterial(project: Project, materialId: string): Promise<void> {
    const material = await this.projectMaterialRepository.findOne({
      id: materialId,
      project,
      isActive: true,
    });

    if (!material) {
      throw new NotFoundException('Material not found in this project');
    }

    material.isActive = false;
    await this.em.persistAndFlush(material);
  }

  async findProjectMaterials(project: Project): Promise<ProjectMaterial[]> {
    return this.projectMaterialRepository.find({project, isActive: true}, {orderBy: {createdAt: 'DESC'}});
  }

  async findMaterialById(project: Project, materialId: string): Promise<ProjectMaterial | undefined> {
    const result = await this.projectMaterialRepository.findOne({
      id: materialId,
      project,
      isActive: true,
    });
    return result ?? undefined;
  }

  // 验证用户权限的辅助方法
  async validateProjectOwnership(projectId: string, user: User): Promise<Project> {
    const project = await this.findById(projectId, user);
    if (!project) {
      throw new NotFoundException('Project not found or you do not have access to it');
    }

    return project;
  }
}
