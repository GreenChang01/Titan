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
 * 项目管理服务
 *
 * 提供完整的项目生命周期管理功能，包括项目的CRUD操作、素材管理和用户权限验证
 * 支持软删除机制、项目状态管理和访问时间跟踪
 *
 * 主要功能：
 * - 项目创建、更新、查询和删除（软删除/硬删除）
 * - 项目素材管理（添加、移除、查询）
 * - 项目资产关联管理
 * - 用户权限验证和所有权检查
 * - 访问时间跟踪和项目排序
 *
 * 技术特性：
 * - 使用MikroORM进行数据库操作
 * - 支持事务性的数据更新
 * - 实现软删除防止数据丢失
 * - 提供批量操作支持
 *
 * @example
 * ```typescript
 * // 创建项目
 * const project = await projectService.createProject({
 *   name: '新项目',
 *   description: '项目描述',
 *   color: '#FF5722'
 * }, userId);
 *
 * // 添加素材
 * await projectService.addAssetsToProject(project.id, assetIds, userId);
 * ```
 *
 * @dependencies
 * - ProjectRepository: 项目数据访问
 * - ProjectMaterialRepository: 项目素材数据访问
 * - AssetRepository: 资产数据访问
 * - ProjectAssetRepository: 项目资产关联数据访问
 * - EntityManager: MikroORM实体管理器
 *
 * @security
 * - 所有操作都进行用户所有权验证
 * - 防止跨用户数据访问
 * - 使用软删除保护重要数据
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
	 *
	 * 创建一个新的项目实体，设置默认值并持久化到数据库
	 * 默认创建为激活状态，项目颜色为蓝色
	 *
	 * @param user 项目所有者用户实体
	 * @param name 项目名称，必须提供
	 * @param description 项目描述，可选
	 * @param color 项目颜色值（十六进制），默认为蓝色 #3B82F6
	 * @returns Promise<Project> 创建的项目实体
	 *
	 * @complexity O(1) - 单次数据库插入操作
	 * @dependencies EntityManager持久化操作
	 * @sideEffects 在数据库中创建新的项目记录
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
	 *
	 * 获取特定用户拥有的所有激活状态的项目，按访问时间和创建时间排序
	 * 自动预加载项目素材信息以提高查询效率
	 *
	 * @param user 用户实体，用于筛选项目所有者
	 * @returns Promise<Project[]> 项目列表，按最后访问时间和创建时间倒序排列
	 *
	 * @complexity O(n) - n为用户激活项目数量
	 * @dependencies ProjectRepository查询，预加载素材关联
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
	 * 根据ID查找特定项目
	 *
	 * 查找特定用户拥有的特定项目，包含用户权限验证
	 * 自动预加载项目素材信息供后续操作使用
	 *
	 * @param id 项目唯一标识符
	 * @param user 用户实体，用于权限验证
	 * @returns Promise<Project | undefined> 找到的项目实体，未找到返回undefined
	 *
	 * @complexity O(1) - 数据库主键查询
	 * @dependencies ProjectRepository查询，预加载素材关联
	 */
	async findById(id: string, user: User): Promise<Project | undefined> {
		const result = await this.projectRepository.findOne({id, user}, {populate: ['materials']});
		return result ?? undefined;
	}

	/**
	 * 更新项目信息
	 *
	 * 选择性更新项目的名称、描述和颜色信息
	 * 只更新提供的字段，其他字段保持不变
	 *
	 * @param project 要更新的项目实体
	 * @param name 新项目名称，可选
	 * @param description 新项目描述，可选（传入undefined可清空描述）
	 * @param color 新项目颜色，可选
	 * @returns Promise<Project> 更新后的项目实体
	 *
	 * @complexity O(1) - 单次数据库更新操作
	 * @dependencies EntityManager持久化操作
	 * @sideEffects 更新数据库中的项目记录，自动更新updatedAt时间戳
	 */
	async update(project: Project, name?: string, description?: string, color?: string): Promise<Project> {
		if (name) {
			project.name = name;
		}

		if (description !== undefined) {
			project.description = description;
		}

		if (color) {
			project.color = color;
		}

		await this.em.persistAndFlush(project);
		return project;
	}

	/**
	 * 更新项目最后访问时间
	 *
	 * 记录用户访问项目的时间，用于排序和统计分析
	 * 该操作会在用户访问项目详情或进行项目操作时被调用
	 *
	 * @param project 要更新访问时间的项目实体
	 * @returns Promise<void> 操作完成
	 *
	 * @complexity O(1) - 单次数据库更新操作
	 * @dependencies EntityManager持久化操作
	 * @sideEffects 更新数据库中的lastAccessedAt字段
	 */
	async updateLastAccessed(project: Project): Promise<void> {
		project.lastAccessedAt = new Date();
		await this.em.persistAndFlush(project);
	}

	/**
	 * 软删除项目（设置为非激活状态）
	 *
	 * 将项目标记为非激活状态而不是物理删除，保留数据以便恢复
	 * 这是推荐的删除方式，可以防止意外数据丢失
	 *
	 * @param project 要删除的项目实体
	 * @returns Promise<void> 操作完成
	 *
	 * @complexity O(1) - 单次数据库更新操作
	 * @dependencies EntityManager持久化操作
	 * @sideEffects 更新数据库中的isActive字段为false，项目不再出现在常规查询中
	 */
	async delete(project: Project): Promise<void> {
		project.isActive = false;
		await this.em.persistAndFlush(project);
	}

	/**
	 * 硬删除项目（从数据库中永久删除）
	 *
	 * 从数据库中完全移除项目记录，操作不可逆
	 * 谨慎使用，通常用于管理员清理或特殊情况
	 *
	 * @param project 要永久删除的项目实体
	 * @returns Promise<void> 操作完成
	 *
	 * @complexity O(1) - 单次数据库删除操作，但可能触发级联删除
	 * @dependencies EntityManager移除操作
	 * @sideEffects 永久删除数据库记录，可能触发外键约束或级联删除
	 * @warning 不可逆操作，将完全丢失项目数据
	 */
	async hardDelete(project: Project): Promise<void> {
		await this.em.removeAndFlush(project);
	}

	/**
	 * 向项目添加素材
	 *
	 * 将新素材添加到项目中，支持阿里云盘文件的元数据信息
	 * 在添加前检查素材是否已存在，防止重复添加
	 *
	 * @param project 目标项目实体
	 * @param addMaterialDto 素材信息DTO，包含文件ID、名称、路径等信息
	 * @returns Promise<ProjectMaterial> 创建的项目素材实体
	 *
	 * @throws {ConflictException} 当素材已存在于项目中时
	 *
	 * @complexity O(1) - 单次查询和插入操作
	 * @dependencies ProjectMaterialRepository查询和创建，EntityManager持久化
	 * @sideEffects 在数据库中创建新的项目素材关联记录
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
	 *
	 * 将项目中的素材设置为非激活状态（软删除）
	 * 验证素材存在性和所属关系后执行删除操作
	 *
	 * @param project 项目实体，用于验证所属关系
	 * @param materialId 要移除的素材唯一标识符
	 * @returns Promise<void> 操作完成
	 *
	 * @throws {NotFoundException} 当素材不存在于项目中时
	 *
	 * @complexity O(1) - 单次查询和更新操作
	 * @dependencies ProjectMaterialRepository查询，EntityManager持久化
	 * @sideEffects 更新数据库中素材的isActive字段为false
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
	 * 查找项目的所有激活素材
	 *
	 * 获取项目中所有激活状态的素材，按创建时间倒序排列
	 * 返回完整的素材信息包括文件元数据和描述
	 *
	 * @param project 项目实体，用于筛选素材所属项目
	 * @returns Promise<ProjectMaterial[]> 项目素材列表，按创建时间倒序排列
	 *
	 * @complexity O(n) - n为项目激活素材数量
	 * @dependencies ProjectMaterialRepository查询
	 */
	async findProjectMaterials(project: Project): Promise<ProjectMaterial[]> {
		return this.projectMaterialRepository.find({project, isActive: true}, {orderBy: {createdAt: 'DESC'}});
	}

	/**
	 * 根据ID查找项目中的特定素材
	 *
	 * 在特定项目中查找激活状态的素材，包含项目所属关系验证
	 * 用于验证素材存在性和权限检查
	 *
	 * @param project 项目实体，用于验证所属关系
	 * @param materialId 素材唯一标识符
	 * @returns Promise<ProjectMaterial | undefined> 找到的项目素材实体，未找到返回undefined
	 *
	 * @complexity O(1) - 数据库索引查询
	 * @dependencies ProjectMaterialRepository查询
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
	 *
	 * 检查特定用户是否为指定项目的所有者，用于权限控制
	 * 这是一个重要的安全检查方法，应在所有项目操作前调用
	 *
	 * @param projectId 项目唯一标识符
	 * @param user 要验证的用户实体
	 * @returns Promise<Project> 验证通过的项目实体
	 *
	 * @throws {NotFoundException} 当项目不存在或用户无访问权限时
	 *
	 * @complexity O(1) - 单次数据库查询
	 * @dependencies findById方法
	 * @security 防止跨用户访问，确保数据安全
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
	 *
	 * V1.1新增方法，根据用户ID获取所有激活状态的项目
	 * 按更新时间倒序排列，使用项目状态枚举进行筛选
	 *
	 * @param userId 用户唯一标识符
	 * @returns Promise<Project[]> 用户拥有的激活项目列表
	 *
	 * @complexity O(n) - n为用户激活项目数量
	 * @dependencies ProjectRepository查询
	 * @since 1.1.0
	 */
	async getProjectsByUser(userId: string): Promise<Project[]> {
		return this.projectRepository.find({user: userId, status: ProjectStatus.ACTIVE}, {orderBy: {updatedAt: 'DESC'}});
	}

	/**
	 * 获取项目及其关联的素材
	 *
	 * V1.1新增方法，获取项目信息并预加载关联的资产列表
	 * 返回的对象包含项目的所有字段和一个额外的assets数组
	 *
	 * @param projectId 项目唯一标识符
	 * @param userId 用户唯一标识符，用于权限验证
	 * @returns Promise<Project & {assets: Asset[]}> 包含资产列表的项目对象
	 *
	 * @throws {NotFoundException} 当项目不存在或用户无权访问时
	 *
	 * @complexity O(n) - n为项目关联的资产数量
	 * @dependencies ProjectRepository查询, ProjectAssetRepository查询并预加载资产
	 * @since 1.1.0
	 */
	async getProjectWithAssets(projectId: string, userId: string): Promise<Project & {assets: Asset[]}> {
		const project = await this.projectRepository.findOne({id: projectId, user: userId});
		if (!project) {
			throw new NotFoundException('Project not found');
		}

		const projectAssets = await this.projectAssetRepository.find({project: projectId}, {populate: ['asset']});

		const assets = projectAssets.map((pa) => pa.asset);
		return {...project, assets};
	}

	/**
	 * 更新项目信息
	 *
	 * V1.1新增方法，使用DTO模式更新项目信息
	 * 支持部分更新，只更新DTO中提供的字段
	 * 支持更新项目状态（新增功能）
	 *
	 * @param projectId 项目唯一标识符
	 * @param updateDto 项目更新数据传输对象
	 * @param userId 用户唯一标识符，用于权限验证
	 * @returns Promise<Project> 更新后的项目实体
	 *
	 * @throws {NotFoundException} 当项目不存在或用户无权访问时
	 *
	 * @complexity O(1) - 单次数据库查询和更新
	 * @dependencies ProjectRepository查询, EntityManager持久化
	 * @since 1.1.0
	 */
	async updateProject(projectId: string, updateDto: UpdateProjectDto, userId: string): Promise<Project> {
		const project = await this.projectRepository.findOne({id: projectId, user: userId});
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
	 * 删除项目（软删除）
	 *
	 * V1.1新增方法，将项目状态设置为PAUSED而不是物理删除
	 * 这与旧的delete方法不同，使用状态枚举而不是isActive字段
	 *
	 * @param projectId 项目唯一标识符
	 * @param userId 用户唯一标识符，用于权限验证
	 * @returns Promise<void> 操作完成
	 *
	 * @throws {NotFoundException} 当项目不存在或用户无权访问时
	 *
	 * @complexity O(1) - 单次数据库查询和更新
	 * @dependencies ProjectRepository查询, EntityManager持久化
	 * @since 1.1.0
	 */
	async deleteProject(projectId: string, userId: string): Promise<void> {
		const project = await this.projectRepository.findOne({id: projectId, user: userId});
		if (!project) {
			throw new NotFoundException('Project not found');
		}

		project.status = ProjectStatus.PAUSED;
		await this.em.persistAndFlush(project);
	}

	/**
	 * 批量添加资产到项目
	 *
	 * V1.1新增方法，将多个资产批量关联到项目
	 * 包含完整的权限验证和重复检查，自动过滤已存在的关联
	 * 同时更新项目的资产计数器
	 *
	 * @param projectId 项目唯一标识符
	 * @param assetIds 要添加的资产ID数组
	 * @param userId 用户唯一标识符，用于权限验证
	 * @returns Promise<void> 操作完成
	 *
	 * @throws {NotFoundException} 当项目不存在、部分资产不存在或用户无权访问时
	 *
	 * @complexity O(n) - n为资产数量，包含查询和批量创建操作
	 * @dependencies ProjectRepository, AssetRepository, ProjectAssetRepository, EntityManager
	 * @sideEffects 创建项目-资产关联记录，更新项目资产计数
	 * @since 1.1.0
	 */
	async addAssetsToProject(projectId: string, assetIds: string[], userId: string): Promise<void> {
		const project = await this.projectRepository.findOne({id: projectId, user: userId});
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
			project: projectId,
			asset: {$in: assetIds},
		});

		const existingAssetIds = new Set(existingProjectAssets.map((pa) => pa.asset.id));
		const newAssetIds = assetIds.filter((id) => !existingAssetIds.has(id));

		for (const assetId of newAssetIds) {
			const asset = await this.em.findOne(Asset, {id: assetId});
			if (asset) {
				const projectAsset = new ProjectAsset();
				projectAsset.project = project;
				projectAsset.asset = asset;
				this.em.persist(projectAsset);
			}
		}

		project.assetCount += newAssetIds.length;
		await this.em.persistAndFlush(project);
	}

	/**
	 * 从项目中移除单个资产
	 *
	 * V1.1新增方法，从项目中移除单个资产关联
	 * 执行硬删除（与素材的软删除不同）并更新计数器
	 *
	 * @param projectId 项目唯一标识符
	 * @param assetId 要移除的资产唯一标识符
	 * @param userId 用户唯一标识符，用于权限验证
	 * @returns Promise<void> 操作完成
	 *
	 * @throws {NotFoundException} 当项目不存在、资产不在项目中或用户无权访问时
	 *
	 * @complexity O(1) - 单次查询和删除操作
	 * @dependencies ProjectRepository, ProjectAssetRepository, EntityManager
	 * @sideEffects 永久删除项目-资产关联记录，更新项目资产计数
	 * @since 1.1.0
	 */
	async removeAssetFromProject(projectId: string, assetId: string, userId: string): Promise<void> {
		const project = await this.projectRepository.findOne({id: projectId, user: userId});
		if (!project) {
			throw new NotFoundException('Project not found');
		}

		const projectAsset = await this.projectAssetRepository.findOne({
			project: projectId,
			asset: assetId,
		});

		if (!projectAsset) {
			throw new NotFoundException('Asset not found in project');
		}

		await this.em.removeAndFlush(projectAsset);

		project.assetCount = Math.max(0, project.assetCount - 1);
		await this.em.persistAndFlush(project);
	}

	/**
	 * 获取项目的资产列表
	 *
	 * V1.1新增方法，获取项目关联的所有资产信息
	 * 预加载资产实体数据，返回完整的资产对象数组
	 *
	 * @param projectId 项目唯一标识符
	 * @param userId 用户唯一标识符，用于权限验证
	 * @returns Promise<Asset[]> 项目关联的资产列表
	 *
	 * @throws {NotFoundException} 当项目不存在或用户无权访问时
	 *
	 * @complexity O(n) - n为项目关联的资产数量
	 * @dependencies ProjectRepository, ProjectAssetRepository并预加载资产
	 * @since 1.1.0
	 */
	async getProjectAssets(projectId: string, userId: string): Promise<Asset[]> {
		const project = await this.projectRepository.findOne({id: projectId, user: userId});
		if (!project) {
			throw new NotFoundException('Project not found');
		}

		const projectAssets = await this.projectAssetRepository.find({project: projectId}, {populate: ['asset']});

		return projectAssets.map((pa) => pa.asset);
	}
}
