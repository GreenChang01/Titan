import {Test, type TestingModule} from '@nestjs/testing';
import {getRepositoryToken} from '@mikro-orm/nestjs';
import {EntityManager, type EntityRepository} from '@mikro-orm/core';
import {ConfigService} from '@nestjs/config';
import {BadRequestException} from '@nestjs/common';
import {AIImageGenerationService} from './ai-image-generation.service';
import {AIGeneratedImage} from '../entities/ai-generated-image.entity';
import {Asset} from '../../asset/entities/asset.entity';
import {AssetType} from '../../common/enums/asset-type.enum';

/**
 * AI图片生成服务单元测试
 * 测试Pollinations.AI集成和图片元数据管理
 */
describe('AIImageGenerationService', () => {
	let service: AIImageGenerationService;
	let aiImageRepository: jest.Mocked<EntityRepository<AIGeneratedImage>>;
	let assetRepository: jest.Mocked<EntityRepository<Asset>>;
	let entityManager: jest.Mocked<EntityManager>;
	let configService: jest.Mocked<ConfigService>;

	const mockUserId = 'test-user-id';
	const mockPrompt = '美丽的夕阳海景';

	beforeEach(async () => {
		// 模拟仓储对象
		const mockAIImageRepository = {
			findOne: jest.fn(),
			findAndCount: jest.fn(),
			getEntityManager: jest.fn(),
		};

		const mockAssetRepository = {
			findOne: jest.fn(),
		};

		const mockEntityManager = {
			persistAndFlush: jest.fn(),
			removeAndFlush: jest.fn(),
			getConnection: jest.fn().mockReturnValue({
				execute: jest.fn(),
			}),
		};

		const mockConfigService = {
			get: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AIImageGenerationService,
				{
					provide: getRepositoryToken(AIGeneratedImage),
					useValue: mockAIImageRepository,
				},
				{
					provide: getRepositoryToken(Asset),
					useValue: mockAssetRepository,
				},
				{
					provide: EntityManager,
					useValue: mockEntityManager,
				},
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
			],
		}).compile();

		service = module.get<AIImageGenerationService>(AIImageGenerationService);
		aiImageRepository = module.get(getRepositoryToken(AIGeneratedImage));
		assetRepository = module.get(getRepositoryToken(Asset));
		entityManager = module.get<EntityManager>(EntityManager);
		configService = module.get<ConfigService>(ConfigService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('应该正确初始化服务', () => {
		expect(service).toBeDefined();
	});

	describe('generateImage', () => {
		it('应该成功生成AI图片', async () => {
			// 准备测试数据
			const options = {
				width: 1024,
				height: 1024,
				seed: 12_345,
				nologo: true,
				model: 'turbo',
			};

			const mockAsset = new Asset({
				userId: mockUserId,
				fileName: `AI生成图片_${mockPrompt.slice(0, 50)}`,
				originalName: `AI生成图片_${mockPrompt.slice(0, 50)}`,
				filePath: 'https://image.pollinations.ai/prompt/test',
				fileSize: 0,
				mimeType: 'image/png',
				assetType: AssetType.AI_GENERATED_IMAGE,
				uploadSource: 'AI_GENERATED' as any,
			});

			const mockAIImage = new AIGeneratedImage({
				asset: mockAsset,
				prompt: mockPrompt,
				seed: options.seed,
				generationUrl: 'https://image.pollinations.ai/prompt/test',
				pollinationsParams: options,
			});

			// 模拟URL验证成功
			jest.spyOn(service as any, 'validateImageUrl').mockResolvedValue(true);

			// 模拟数据库操作
			entityManager.persistAndFlush.mockResolvedValue(undefined);

			// 执行测试
			const result = await service.generateImage(mockPrompt, mockUserId, options);

			// 验证结果
			expect(result).toBeInstanceOf(AIGeneratedImage);
			expect(result.prompt).toBe(mockPrompt);
			expect(result.seed).toBe(options.seed);
			expect(entityManager.persistAndFlush).toHaveBeenCalledTimes(2);
		});

		it('应该在提示词为空时抛出异常', async () => {
			await expect(service.generateImage('', mockUserId)).rejects.toThrow(
				BadRequestException,
			);
			await expect(service.generateImage('   ', mockUserId)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('应该在提示词过长时抛出异常', async () => {
			const longPrompt = 'a'.repeat(2001);
			await expect(service.generateImage(longPrompt, mockUserId)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('应该在URL验证失败时抛出异常', async () => {
			// 模拟URL验证失败
			jest.spyOn(service as any, 'validateImageUrl').mockResolvedValue(false);

			await expect(service.generateImage(mockPrompt, mockUserId)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('应该使用默认参数', async () => {
			// 模拟URL验证成功
			jest.spyOn(service as any, 'validateImageUrl').mockResolvedValue(true);
			entityManager.persistAndFlush.mockResolvedValue(undefined);

			const result = await service.generateImage(mockPrompt, mockUserId);

			expect(result.pollinationsParams).toMatchObject({
				width: 1024,
				height: 1024,
				nologo: true,
				model: 'turbo',
			});
			expect(result.pollinationsParams.seed).toBeDefined();
		});
	});

	describe('buildPollinationsUrl', () => {
		it('应该正确构建Pollinations.AI URL', () => {
			const options = {
				width: 512,
				height: 512,
				seed: 12_345,
				nologo: true,
				model: 'turbo',
			};

			const url = (service as any).buildPollinationsUrl(mockPrompt, options);

			expect(url).toContain('https://image.pollinations.ai/prompt/');
			expect(url).toContain(encodeURIComponent(mockPrompt));
			expect(url).toContain('width=512');
			expect(url).toContain('height=512');
			expect(url).toContain('seed=12_345');
			expect(url).toContain('nologo=true');
			expect(url).toContain('model=turbo');
		});

		it('应该正确处理没有参数的情况', () => {
			const url = (service as any).buildPollinationsUrl(mockPrompt, {});

			expect(url).toBe(
				`https://image.pollinations.ai/prompt/${encodeURIComponent(mockPrompt)}`,
			);
		});
	});

	describe('validateImageUrl', () => {
		it('应该验证有效的HTTP/HTTPS URL', async () => {
			const validUrls = [
				'https://example.com/image.jpg',
				'http://example.com/image.png',
			];

			for (const url of validUrls) {
				const result = await (service as any).validateImageUrl(url);
				expect(result).toBe(true);
			}
		});

		it('应该拒绝无效的URL', async () => {
			const invalidUrls = ['ftp://example.com', 'invalid-url', ''];

			for (const url of invalidUrls) {
				const result = await (service as any).validateImageUrl(url);
				expect(result).toBe(false);
			}
		});
	});

	describe('getUserGenerationHistory', () => {
		it('应该返回用户的生成历史', async () => {
			const mockItems = [
				new AIGeneratedImage({
					asset: new Asset({
						userId: mockUserId,
						fileName: 'test.png',
						originalName: 'test.png',
						filePath: '/test.png',
						fileSize: 100,
						mimeType: 'image/png',
						assetType: AssetType.AI_GENERATED_IMAGE,
						uploadSource: 'AI_GENERATED' as any,
					}),
					prompt: mockPrompt,
					seed: 12_345,
					generationUrl: 'https://test.com/image.jpg',
				}),
			];

			aiImageRepository.findAndCount.mockResolvedValue([mockItems, 1]);

			const result = await service.getUserGenerationHistory(mockUserId);

			expect(result.items).toHaveLength(1);
			expect(result.total).toBe(1);
			expect(aiImageRepository.findAndCount).toHaveBeenCalledWith(
				{asset: {userId: mockUserId}},
				{
					populate: ['asset'],
					orderBy: {generatedAt: 'DESC'},
					limit: 20,
					offset: 0,
				},
			);
		});

		it('应该支持分页参数', async () => {
			aiImageRepository.findAndCount.mockResolvedValue([[], 0]);

			await service.getUserGenerationHistory(mockUserId, 10, 5);

			expect(aiImageRepository.findAndCount).toHaveBeenCalledWith(
				{asset: {userId: mockUserId}},
				{
					populate: ['asset'],
					orderBy: {generatedAt: 'DESC'},
					limit: 10,
					offset: 5,
				},
			);
		});
	});

	describe('getAIImageById', () => {
		it('应该根据ID获取AI图片', async () => {
			const mockId = 'test-id';
			const mockAIImage = new AIGeneratedImage({
				asset: new Asset({
					userId: mockUserId,
					fileName: 'test.png',
					originalName: 'test.png',
					filePath: '/test.png',
					fileSize: 100,
					mimeType: 'image/png',
					assetType: AssetType.AI_GENERATED_IMAGE,
					uploadSource: 'AI_GENERATED' as any,
				}),
				prompt: mockPrompt,
				seed: 12_345,
				generationUrl: 'https://test.com/image.jpg',
			});

			aiImageRepository.findOne.mockResolvedValue(mockAIImage);

			const result = await service.getAIImageById(mockId, mockUserId);

			expect(result).toBe(mockAIImage);
			expect(aiImageRepository.findOne).toHaveBeenCalledWith(
				{id: mockId, asset: {userId: mockUserId}},
				{populate: ['asset']},
			);
		});

		it('应该在图片不存在时返回null', async () => {
			aiImageRepository.findOne.mockResolvedValue(null);

			const result = await service.getAIImageById('non-existent', mockUserId);

			expect(result).toBeNull();
		});
	});

	describe('deleteAIImage', () => {
		it('应该成功删除AI图片', async () => {
			const mockId = 'test-id';
			const mockAsset = new Asset({
				userId: mockUserId,
				fileName: 'test.png',
				originalName: 'test.png',
				filePath: '/test.png',
				fileSize: 100,
				mimeType: 'image/png',
				assetType: AssetType.AI_GENERATED_IMAGE,
				uploadSource: 'AI_GENERATED' as any,
			});

			const mockAIImage = new AIGeneratedImage({
				asset: mockAsset,
				prompt: mockPrompt,
				seed: 12_345,
				generationUrl: 'https://test.com/image.jpg',
			});

			jest.spyOn(service, 'getAIImageById').mockResolvedValue(mockAIImage);
			entityManager.removeAndFlush.mockResolvedValue(undefined);

			const result = await service.deleteAIImage(mockId, mockUserId);

			expect(result).toBe(true);
			expect(entityManager.removeAndFlush).toHaveBeenCalledWith([
				mockAIImage,
				mockAIImage.asset,
			]);
		});

		it('应该在图片不存在时返回false', async () => {
			jest.spyOn(service, 'getAIImageById').mockResolvedValue(null);

			const result = await service.deleteAIImage('non-existent', mockUserId);

			expect(result).toBe(false);
			expect(entityManager.removeAndFlush).not.toHaveBeenCalled();
		});
	});

	describe('getPopularPrompts', () => {
		it('应该返回热门提示词', async () => {
			const mockResults = [
				{prompt: '美丽的风景', count: '5'},
				{prompt: '可爱的动物', count: '3'},
			];

			const mockConnection = {
				execute: jest.fn().mockResolvedValue(mockResults),
			};

			aiImageRepository.getEntityManager.mockReturnValue({
				getConnection: () => mockConnection,
			} as any);

			const result = await service.getPopularPrompts(2);

			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({prompt: '美丽的风景', count: 5});
			expect(result[1]).toEqual({prompt: '可爱的动物', count: 3});
		});

		it('应该在发生错误时返回空数组', async () => {
			const mockConnection = {
				execute: jest.fn().mockRejectedValue(new Error('Database error')),
			};

			aiImageRepository.getEntityManager.mockReturnValue({
				getConnection: () => mockConnection,
			} as any);

			const result = await service.getPopularPrompts();

			expect(result).toEqual([]);
		});
	});
});
