import {Test, TestingModule} from '@nestjs/testing';
import {EntityManager} from '@mikro-orm/core';
import {getRepositoryToken} from '@mikro-orm/nestjs';
import {HttpException, HttpStatus} from '@nestjs/common';
import {ProjectMaterial} from '../project-material/entities/project-material.entity';
import {Asset} from '../asset/entities/asset.entity';
import {ProjectAsset} from '../asset/entities/project-asset.entity';
import {
  createMockUser,
  createMockProject,
  createMockProjectMaterial,
  createMockRepository,
  MockRepository,
} from '../../test/factories/entity-factory';
import {ProjectService} from './project.service';
import {Project} from './entities/project.entity';

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepository: MockRepository<Project>;
  let projectMaterialRepository: MockRepository<ProjectMaterial>;
  let assetRepository: MockRepository<Asset>;
  let projectAssetRepository: MockRepository<ProjectAsset>;
  let entityManager: {persistAndFlush: jest.Mock; flush: jest.Mock};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: createMockRepository<Project>(),
        },
        {
          provide: getRepositoryToken(ProjectMaterial),
          useValue: createMockRepository<ProjectMaterial>(),
        },
        {
          provide: getRepositoryToken(Asset),
          useValue: createMockRepository<Asset>(),
        },
        {
          provide: getRepositoryToken(ProjectAsset),
          useValue: createMockRepository<ProjectAsset>(),
        },
        {
          provide: EntityManager,
          useValue: {
            persistAndFlush: jest.fn(),
            flush: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    projectRepository = module.get(getRepositoryToken(Project));
    projectMaterialRepository = module.get(getRepositoryToken(ProjectMaterial));
    assetRepository = module.get(getRepositoryToken(Asset));
    projectAssetRepository = module.get(getRepositoryToken(ProjectAsset));
    entityManager = module.get(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project successfully', async () => {
      // Arrange
      const mockUser = createMockUser();
      const expectedProject = createMockProject({
        name: 'New Project',
        description: 'New Description',
        color: '#123456',
        user: mockUser,
      });

      entityManager.persistAndFlush.mockResolvedValue(undefined);

      // Act
      const result = await service.create(mockUser, 'New Project', 'New Description', '#123456');

      // Assert
      expect(entityManager.persistAndFlush).toHaveBeenCalled();
      expect(result.name).toBe('New Project');
      expect(result.description).toBe('New Description');
      expect(result.color).toBe('#123456');
      expect(result.user).toBe(mockUser);
    });

    it('should create project with default color when not provided', async () => {
      // Arrange
      const mockUser = createMockUser();
      entityManager.persistAndFlush.mockResolvedValue(undefined);

      // Act
      const result = await service.create(mockUser, 'Minimal Project');

      // Assert
      expect(result.name).toBe('Minimal Project');
      expect(result.color).toBe('#3B82F6'); // 默认蓝色
      expect(result.user).toBe(mockUser);
    });
  });

  describe('findAllByUser', () => {
    it('should return all active projects for user', async () => {
      // Arrange
      const mockUser = createMockUser();
      const mockProjects = [
        createMockProject({id: 'project-1', user: mockUser}),
        createMockProject({id: 'project-2', user: mockUser}),
      ];

      projectRepository.find.mockResolvedValue(mockProjects);

      // Act
      const result = await service.findAllByUser(mockUser);

      // Assert
      expect(projectRepository.find).toHaveBeenCalledWith(
        {user: mockUser, isActive: true},
        expect.objectContaining({
          orderBy: expect.any(Object),
        }),
      );
      expect(result).toBe(mockProjects);
    });

    it('should return empty array when no projects found', async () => {
      // Arrange
      const mockUser = createMockUser();
      projectRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAllByUser(mockUser);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('validateProjectOwnership', () => {
    it('should return project when user owns it', async () => {
      // Arrange
      const mockUser = createMockUser();
      const mockProject = createMockProject({user: mockUser});
      projectRepository.findOne.mockResolvedValue(mockProject);

      // Act
      const result = await service.validateProjectOwnership('project-123', mockUser);

      // Assert
      expect(projectRepository.findOne).toHaveBeenCalledWith(
        {id: 'project-123', user: mockUser},
        {populate: ['materials']},
      );
      expect(result).toBe(mockProject);
    });

    it('should throw NOT_FOUND when project does not exist', async () => {
      // Arrange
      const mockUser = createMockUser();
      projectRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateProjectOwnership('nonexistent', mockUser)).rejects.toThrow(
        'Project not found or you do not have access to it',
      );
    });
  });

  describe('update', () => {
    it('should update project successfully', async () => {
      // Arrange
      const mockProject = createMockProject();
      entityManager.persistAndFlush.mockResolvedValue(undefined);

      // Act
      const result = await service.update(mockProject, 'Updated Name', 'Updated Description', '#ABCDEF');

      // Assert
      expect(mockProject.name).toBe('Updated Name');
      expect(mockProject.description).toBe('Updated Description');
      expect(mockProject.color).toBe('#ABCDEF');
      expect(entityManager.persistAndFlush).toHaveBeenCalledWith(mockProject);
      expect(result).toBe(mockProject);
    });
  });

  describe('delete', () => {
    it('should soft delete project', async () => {
      // Arrange
      const mockProject = createMockProject();
      entityManager.persistAndFlush.mockResolvedValue(undefined);

      // Act
      await service.delete(mockProject);

      // Assert
      expect(mockProject.isActive).toBe(false);
      expect(entityManager.persistAndFlush).toHaveBeenCalledWith(mockProject);
    });
  });

  describe('updateLastAccessed', () => {
    it('should update last accessed time', async () => {
      // Arrange
      const mockProject = createMockProject();
      const beforeTime = new Date();

      entityManager.persistAndFlush.mockResolvedValue(undefined);

      // Act
      await service.updateLastAccessed(mockProject);

      // Assert
      expect(mockProject.lastAccessedAt).toBeDefined();
      expect(mockProject.lastAccessedAt).toBeInstanceOf(Date);
      expect(mockProject.lastAccessedAt!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(entityManager.persistAndFlush).toHaveBeenCalledWith(mockProject);
    });
  });

  describe('addMaterial', () => {
    it('should add material to project successfully', async () => {
      // Arrange
      const mockProject = createMockProject();
      const materialDto = {
        aliyunFileId: 'file-456',
        fileName: 'new-file.png',
        filePath: '/path/to/new-file.png',
        fileType: 'image/png',
        fileSize: 2048,
      };

      projectMaterialRepository.findOne.mockResolvedValue(null); // No existing material
      entityManager.persistAndFlush.mockResolvedValue(undefined);

      // Act
      const result = await service.addMaterial(mockProject, materialDto);

      // Assert
      expect(projectMaterialRepository.findOne).toHaveBeenCalledWith({
        project: mockProject,
        aliyunFileId: materialDto.aliyunFileId,
        isActive: true,
      });
      expect(entityManager.persistAndFlush).toHaveBeenCalled();
      expect(result.aliyunFileId).toBe(materialDto.aliyunFileId);
      expect(result.fileName).toBe(materialDto.fileName);
      expect(result.project).toBe(mockProject);
    });
  });

  describe('removeMaterial', () => {
    it('should remove material from project successfully', async () => {
      // Arrange
      const mockProject = createMockProject();
      const mockMaterial = createMockProjectMaterial({
        id: 'material-123',
        project: mockProject,
      });

      projectMaterialRepository.findOne.mockResolvedValue(mockMaterial);
      entityManager.persistAndFlush.mockResolvedValue(undefined);

      // Act
      await service.removeMaterial(mockProject, 'material-123');

      // Assert
      expect(projectMaterialRepository.findOne).toHaveBeenCalledWith({
        id: 'material-123',
        project: mockProject,
        isActive: true,
      });
      expect(mockMaterial.isActive).toBe(false);
      expect(entityManager.persistAndFlush).toHaveBeenCalledWith(mockMaterial);
    });

    it('should throw NOT_FOUND when material does not exist', async () => {
      // Arrange
      const mockProject = createMockProject();
      projectMaterialRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.removeMaterial(mockProject, 'nonexistent')).rejects.toThrow(
        'Material not found in this project',
      );
    });
  });

  describe('findProjectMaterials', () => {
    it('should return all materials for project', async () => {
      // Arrange
      const mockProject = createMockProject();
      const mockMaterials = [
        createMockProjectMaterial({id: 'material-1', project: mockProject}),
        createMockProjectMaterial({id: 'material-2', project: mockProject}),
      ];

      projectMaterialRepository.find.mockResolvedValue(mockMaterials);

      // Act
      const result = await service.findProjectMaterials(mockProject);

      // Assert
      expect(projectMaterialRepository.find).toHaveBeenCalledWith(
        {project: mockProject, isActive: true},
        {orderBy: {createdAt: 'DESC'}},
      );
      expect(result).toBe(mockMaterials);
    });
  });
});
