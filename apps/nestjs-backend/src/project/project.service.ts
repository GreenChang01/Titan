import {Injectable, NotFoundException, ConflictException} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository, EntityManager} from '@mikro-orm/core';
import {ProjectMaterial} from '../project-material/entities/project-material.entity';
import {User} from '../users/entities/user.entity';
import {Asset} from '../asset/entities/asset.entity';
import {ProjectAsset} from '../asset/entities/project-asset.entity';
import {ProjectStatus} from '../common/enums';
import {Project} from './entities/project.entity';
import {AddMaterialDto} from './dto/add-material.dto';
import {CreateProjectDto} from './dto/create-project.dto';
import {UpdateProjectDto} from './dto/update-project.dto';

/**
 * 项目服务
 * 提供项目的创建、查询、更新、删除功能，以及项目素材的管理功能
 */
@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: EntityRepository<Project>,
    @InjectRepository(ProjectMaterial)
    private readonly projectMaterialRepository: EntityRepository<ProjectMaterial>,
    @InjectRepository(Asset)
    private readonly assetRepository: EntityRepository<Asset>,
    @InjectRepository(ProjectAsset)
    private readonly projectAssetRepository: EntityRepository<ProjectAsset>,
    private readonly em: EntityManager,
  ) {}

  /**
   * 创建新项目
   * @param user 项目所有者
   * @param name 项目名称
   * @param description 项目描述（可选）
   * @param color 项目颜色（可选，默认为蓝色）
   * @returns 创建的项目实体
   */
  async create(user: User, name: string, description?: string, color?: string): Promise<Project> {
    const project = new Project({
      user,
      name,
      description,
      color: color ?? '#3B82F6', // 默认蓝色
    });

    await this.em.persistAndFlush(project);
    return project;
  }

  /**
   * 查找用户的所有激活项目
   * @param user 用户实体
   * @returns 项目列表，按最后访问时间和创建时间排序
   */
  async findAllByUser(user: User): Promise<Project[]> {
    return this.projectRepository.find(
      {user, isActive: true},
      {
        orderBy: {lastAccessedAt: 'DESC', createdAt: 'DESC'},
        populate: ['materials'],
      },
    );
  }

  /**
   * 根据ID查找项目
   * @param id 项目ID
   * @param user 用户实体
   * @returns 项目实体或undefined
   */
  async findById(id: string, user: User): Promise<Project | undefined> {
    const result = await this.projectRepository.findOne({id, user}, {populate: ['materials']});
    return result ?? undefined;
  }

  /**
   * 更新项目信息
   * @param project 项目实体
   * @param name 新项目名称（可选）
   * @param description 新项目描述（可选）
   * @param color 新项目颜色（可选）
   * @returns 更新后的项目实体
   */
  async update(project: Project, name?: string, description?: string, color?: string): Promise<Project> {
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;

    await this.em.persistAndFlush(project);
    return project;
  }

  /**
   * 更新项目最后访问时间
   * @param project 项目实体
   */
  async updateLastAccessed(project: Project): Promise<void> {
    project.lastAccessedAt = new Date();
    await this.em.persistAndFlush(project);
  }

  /**
   * 软删除项目（设置为非激活状态）
   * @param project 项目实体
   */
  async delete(project: Project): Promise<void> {
    project.isActive = false;
    await this.em.persistAndFlush(project);
  }

  /**
   * 硬删除项目（从数据库中永久删除）
   * @param project 项目实体
   */
  async hardDelete(project: Project): Promise<void> {
    await this.em.removeAndFlush(project);
  }

  /**
   * 向项目添加素材
   * @param project 项目实体
   * @param addMaterialDto 素材信息DTO
   * @returns 创建的项目素材实体
   * @throws ConflictException 当素材已存在于项目中时
   */
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

  /**
   * 从项目中移除素材
   * @param project 项目实体
   * @param materialId 素材ID
   * @throws NotFoundException 当素材不存在于项目中时
   */
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

  /**
   * 查找项目的所有素材
   * @param project 项目实体
   * @returns 项目素材列表，按创建时间倒序排列
   */
  async findProjectMaterials(project: Project): Promise<ProjectMaterial[]> {
    return this.projectMaterialRepository.find({project, isActive: true}, {orderBy: {createdAt: 'DESC'}});
  }

  /**
   * 根据ID查找项目中的特定素材
   * @param project 项目实体
   * @param materialId 素材ID
   * @returns 项目素材实体或undefined
   */
  async findMaterialById(project: Project, materialId: string): Promise<ProjectMaterial | undefined> {
    const result = await this.projectMaterialRepository.findOne({
      id: materialId,
      project,
      isActive: true,
    });
    return result ?? undefined;
  }

  /**
   * 验证用户对项目的所有权
   * @param projectId 项目ID
   * @param user 用户实体
   * @returns 项目实体
   * @throws NotFoundException 当项目不存在或用户无访问权限时
   */
  async validateProjectOwnership(projectId: string, user: User): Promise<Project> {
    const project = await this.findById(projectId, user);
    if (!project) {
      throw new NotFoundException('Project not found or you do not have access to it');
    }

    return project;
  }

  // === V1.1 新增方法 ===

  /**
   * 使用DTO创建项目
   */
  async createProject(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    // 获取用户实体
    const user = await this.em.findOne(User, {id: userId});
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const project = new Project({
      name: createProjectDto.name,
      description: createProjectDto.description,
      color: createProjectDto.color || '#3B82F6',
      user,
    });

    await this.em.persistAndFlush(project);
    return project;
  }

  /**
   * 获取用户的所有项目
   */
  async getProjectsByUser(userId: string): Promise<Project[]> {
    return this.projectRepository.find({userId, status: ProjectStatus.ACTIVE}, {orderBy: {updatedAt: 'DESC'}});
  }

  /**
   * 获取项目及其关联的素材
   */
  async getProjectWithAssets(projectId: string, userId: string): Promise<Project & {assets: Asset[]}> {
    const project = await this.projectRepository.findOne({id: projectId, userId});
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const projectAssets = await this.projectAssetRepository.find({projectId}, {populate: ['asset']});

    const assets = projectAssets.map((pa) => pa.asset);
    return {...project, assets};
  }

  /**
   * 更新项目
   */
  async updateProject(projectId: string, updateDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({id: projectId, userId});
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (updateDto.name !== undefined) {
      project.name = updateDto.name;
    }

    if (updateDto.description !== undefined) {
      project.description = updateDto.description;
    }

    if (updateDto.color !== undefined) {
      project.color = updateDto.color;
    }

    if (updateDto.status !== undefined) {
      project.status = updateDto.status;
    }

    await this.em.persistAndFlush(project);
    return project;
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findOne({id: projectId, userId});
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    project.status = ProjectStatus.PAUSED;
    await this.em.persistAndFlush(project);
  }

  /**
   * 添加素材到项目
   */
  async addAssetsToProject(projectId: string, assetIds: string[], userId: string): Promise<void> {
    const project = await this.projectRepository.findOne({id: projectId, userId});
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const assets = await this.assetRepository.find({
      id: {$in: assetIds},
      userId,
    });

    if (assets.length !== assetIds.length) {
      throw new NotFoundException('Some assets not found or access denied');
    }

    const existingProjectAssets = await this.projectAssetRepository.find({
      projectId,
      assetId: {$in: assetIds},
    });

    const existingAssetIds = new Set(existingProjectAssets.map((pa) => pa.assetId));
    const newAssetIds = assetIds.filter((id) => !existingAssetIds.has(id));

    for (const assetId of newAssetIds) {
      const projectAsset = new ProjectAsset();
      projectAsset.projectId = projectId;
      projectAsset.assetId = assetId;
      this.em.persist(projectAsset);
    }

    project.assetCount += newAssetIds.length;
    await this.em.persistAndFlush(project);
  }

  /**
   * 从项目移除素材
   */
  async removeAssetFromProject(projectId: string, assetId: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findOne({id: projectId, userId});
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const projectAsset = await this.projectAssetRepository.findOne({
      projectId,
      assetId,
    });

    if (!projectAsset) {
      throw new NotFoundException('Asset not found in project');
    }

    await this.em.removeAndFlush(projectAsset);

    project.assetCount = Math.max(0, project.assetCount - 1);
    await this.em.persistAndFlush(project);
  }

  /**
   * 获取项目的素材列表
   */
  async getProjectAssets(projectId: string, userId: string): Promise<Asset[]> {
    const project = await this.projectRepository.findOne({id: projectId, userId});
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const projectAssets = await this.projectAssetRepository.find({projectId}, {populate: ['asset']});

    return projectAssets.map((pa) => pa.asset);
  }
}
