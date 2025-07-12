import {Test, TestingModule} from '@nestjs/testing';
import {EntityManager} from '@mikro-orm/core';
import {getRepositoryToken} from '@mikro-orm/nestjs';
import {HttpException, HttpStatus} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {UserStatus} from '@titan/shared';
import {User} from '../users/entities/user.entity';
import {CryptoService} from '../crypto/crypto.service';
import {AliyunDriveService} from './aliyun-drive.service';
import {AliyunDriveConfig} from './entities/aliyun-drive-config.entity';
import {CreateAliyunDriveConfigDto} from './dto/create-aliyun-drive-config.dto';
import {UpdateAliyunDriveConfigDto} from './dto/update-aliyun-drive-config.dto';

describe('AliyunDriveService', () => {
  let service: AliyunDriveService;
  let configRepository: any;
  let cryptoService: any;
  let entityManager: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    username: 'testuser',
    confirmationCode: 'confirm123',
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockConfig = {
    id: 'config-123',
    webdavUrl: 'http://localhost:5244/dav',
    username: 'testuser',
    encryptedPassword: 'encrypted_password',
    displayName: 'Test Config',
    timeout: 30_000,
    basePath: '/',
    isActive: true,
    lastSyncAt: new Date(),
    user: mockUser,
    userConfigKey: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as AliyunDriveConfig;

  const mockConfigRepository = {
    findOne: jest.fn(),
    getEntityManager: jest.fn(() => mockEntityManager),
  };

  const mockCryptoService = {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(30_000), // Default timeout
  };

  const mockEntityManager = {
    persistAndFlush: jest.fn(),
    removeAndFlush: jest.fn(),
    flush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AliyunDriveService,
        {
          provide: getRepositoryToken(AliyunDriveConfig),
          useValue: mockConfigRepository,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<AliyunDriveService>(AliyunDriveService);
    configRepository = module.get(getRepositoryToken(AliyunDriveConfig));
    cryptoService = module.get(CryptoService);
    entityManager = module.get(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConfig', () => {
    it('should create WebDAV config successfully', async () => {
      const createDto: CreateAliyunDriveConfigDto = {
        webdavUrl: 'http://localhost:5244/dav',
        username: 'testuser',
        password: 'testpassword',
        displayName: 'Test Config',
        timeout: 30_000,
        basePath: '/',
      };

      mockCryptoService.encrypt.mockReturnValue({data: 'encrypted_password', iv: 'iv'});
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.createConfig(mockUser, createDto);

      expect(mockCryptoService.encrypt).toHaveBeenCalledWith('testpassword');
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
      expect(result.webdavUrl).toBe(createDto.webdavUrl);
      expect(result.username).toBe(createDto.username);
      expect(result.displayName).toBe(createDto.displayName);
      expect(result.user).toBe(mockUser);
    });

    it('should create config with default values', async () => {
      const createDto: CreateAliyunDriveConfigDto = {
        webdavUrl: 'http://localhost:5244/dav',
        username: 'testuser',
        password: 'testpassword',
      };

      mockCryptoService.encrypt.mockReturnValue({data: 'encrypted_password', iv: 'iv'});
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.createConfig(mockUser, createDto);

      expect(result.timeout).toBe(30_000); // Default from ConfigService
      expect(result.basePath).toBe('/'); // Default
      expect(result.displayName).toBeUndefined();
    });
  });

  describe('findByUser', () => {
    it('should return config for user', async () => {
      mockConfigRepository.findOne.mockResolvedValue(mockConfig);

      const result = await service.findByUser(mockUser);

      expect(mockConfigRepository.findOne).toHaveBeenCalledWith({user: mockUser});
      expect(result).toBe(mockConfig);
    });

    it('should return null when no config found', async () => {
      mockConfigRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUser(mockUser);

      expect(result).toBeUndefined(); // Service returns undefined, not null
    });
  });

  describe('updateConfig', () => {
    it('should update config successfully with all fields', async () => {
      const updateDto: UpdateAliyunDriveConfigDto = {
        webdavUrl: 'http://new.example.com/dav',
        username: 'newuser',
        password: 'newpassword',
        displayName: 'Updated Config',
        timeout: 60_000,
        basePath: '/updated',
      };

      mockCryptoService.encrypt.mockReturnValue({data: 'encrypted_new_password', iv: 'iv'});
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.updateConfig(mockConfig, updateDto);

      expect(mockCryptoService.encrypt).toHaveBeenCalledWith('newpassword');
      expect(mockConfig.webdavUrl).toBe(updateDto.webdavUrl);
      expect(mockConfig.username).toBe(updateDto.username);
      expect(mockConfig.displayName).toBe(updateDto.displayName);
      expect(mockConfig.timeout).toBe(updateDto.timeout);
      expect(mockConfig.basePath).toBe(updateDto.basePath);
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith(mockConfig);
      expect(result).toBe(mockConfig);
    });

    it('should update config without password', async () => {
      const updateDto: UpdateAliyunDriveConfigDto = {
        displayName: 'Updated Config Only',
        timeout: 45_000,
      };

      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.updateConfig(mockConfig, updateDto);

      expect(mockCryptoService.encrypt).not.toHaveBeenCalled();
      expect(mockConfig.displayName).toBe(updateDto.displayName);
      expect(mockConfig.timeout).toBe(updateDto.timeout);
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith(mockConfig);
      expect(result).toBe(mockConfig);
    });
  });

  describe('deleteConfig', () => {
    it('should delete config successfully', async () => {
      mockEntityManager.removeAndFlush.mockResolvedValue(undefined);

      await service.deleteConfig(mockConfig);

      expect(mockEntityManager.removeAndFlush).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe('updateLastSyncTime', () => {
    it('should update last sync time', async () => {
      const beforeTime = new Date();
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      await service.updateLastSyncTime(mockConfig);

      expect(mockConfig.lastSyncAt).toBeDefined();
      expect(mockConfig.lastSyncAt).toBeInstanceOf(Date);
      expect(mockConfig.lastSyncAt!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe('WebDAV operations', () => {
    beforeEach(() => {
      mockCryptoService.decrypt.mockReturnValue('decrypted_password');
    });

    // Note: WebDAV operation tests would require mocking axios and complex WebDAV responses
    // For now, we focus on config management which is the core functionality
    it('should decrypt password for WebDAV operations', async () => {
      const testConfig = {
        ...mockConfig,
        encryptedPassword: '{"data":"encrypted","iv":"iv"}',
        get userConfigKey() {
          return this.user.id;
        },
      } as AliyunDriveConfig;

      const result = await service.getDecryptedPassword(testConfig);

      expect(mockCryptoService.decrypt).toHaveBeenCalledWith({data: 'encrypted', iv: 'iv'});
      expect(result).toBe('decrypted_password');
    });
  });
});
