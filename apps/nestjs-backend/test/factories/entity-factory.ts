import { Collection } from '@mikro-orm/core';
import { User } from '../../src/users/entities/user.entity';
import { Project } from '../../src/project/entities/project.entity';
import { ProjectMaterial } from '../../src/project-material/entities/project-material.entity';
import { AliyunDriveConfig } from '../../src/aliyun-drive/entities/aliyun-drive-config.entity';
import { UserStatus } from '@titan/shared';

// Collection 的 mock 实现
type MockCollection<T extends object> = Partial<Collection<T>> & {
  getItems: () => T[];
  isInitialized: () => boolean;
  add: jest.Mock;
  remove: jest.Mock;
  count: () => number;
};

// 创建 Collection mock 的辅助函数
export function createMockCollection<T extends object>(items: T[] = []): MockCollection<T> {
  return {
    getItems: () => items,
    isInitialized: () => true,
    contains: jest.fn((item: any) => items.includes(item)),
    add: jest.fn(),
    remove: jest.fn(),
    count: () => items.length,
    init: jest.fn(),
    loadItems: jest.fn().mockResolvedValue(items),
  } as MockCollection<T>;
}

// User 实体工厂函数
export function createMockUser(overrides: Partial<User> = {}): User {
  const defaultUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    confirmationCode: 'confirm123',
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    projects: createMockCollection<Project>([]),
    twoFactorAuth: [],
    aliyunDriveConfig: [],
  };

  return { ...defaultUser, ...overrides } as User;
}

// Project 实体工厂函数
export function createMockProject(overrides: Partial<Project> = {}): Project {
  const defaultUser = createMockUser({ id: 'owner-123', username: 'owner' });

  const defaultProject = {
    id: 'project-123',
    name: 'Test Project',
    description: 'Test Description',
    color: '#3B82F6',
    isActive: true,
    lastAccessedAt: new Date('2024-01-01T00:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    user: defaultUser,
    materials: createMockCollection<ProjectMaterial>([]),
  };

  return { ...defaultProject, ...overrides } as Project;
}

// ProjectMaterial 实体工厂函数
export function createMockProjectMaterial(overrides: Partial<ProjectMaterial> = {}): ProjectMaterial {
  const defaultProject = createMockProject({ id: 'material-project-123' });

  const defaultMaterial = {
    id: 'material-123',
    aliyunFileId: 'file-123',
    fileName: 'test.jpg',
    filePath: '/test/path/test.jpg',
    fileType: 'image/jpeg',
    fileSize: 1024,
    isActive: true,
    project: defaultProject,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  return { ...defaultMaterial, ...overrides } as ProjectMaterial;
}

// AliyunDriveConfig 实体工厂函数
export function createMockAliyunDriveConfig(overrides: Partial<AliyunDriveConfig> = {}): AliyunDriveConfig {
  const defaultUser = createMockUser({ id: 'config-user-123' });

  const defaultConfig = {
    id: 'config-123',
    webdavUrl: 'http://localhost:5244/dav',
    username: 'testuser',
    encryptedPassword: 'encrypted_password',
    displayName: 'Test Config',
    timeout: 30000,
    basePath: '/',
    isActive: true,
    lastSyncAt: new Date('2024-01-01T00:00:00Z'),
    user: defaultUser,
    userConfigKey: 'config-user-123',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  return { ...defaultConfig, ...overrides } as AliyunDriveConfig;
}

// Repository mock 辅助函数
export type MockRepository<T extends object> = {
  create: jest.Mock;
  assign: jest.Mock;
  findOne: jest.Mock;
  find: jest.Mock;
  persistAndFlush: jest.Mock;
  removeAndFlush: jest.Mock;
  flush: jest.Mock;
};

export function createMockRepository<T extends object>(): MockRepository<T> {
  return {
    create: jest.fn(),
    assign: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    persistAndFlush: jest.fn(),
    removeAndFlush: jest.fn(),
    flush: jest.fn(),
  };
}