import {Test, type TestingModule} from '@nestjs/testing';
import {getRepositoryToken} from '@mikro-orm/nestjs';
import {EntityManager, type EntityRepository} from '@mikro-orm/core';
import {BadRequestException, NotFoundException} from '@nestjs/common';
import {PromptsService} from './prompts.service';
import {AIPrompt} from '../entities/prompt.entity';
import {PromptTag} from '../entities/prompt-tag.entity';
import {PromptCategory} from '../../common/enums/prompt-category.enum';

/**
 * AI提示词服务单元测试
 * 测试提示词CRUD操作和标签管理
 */
describe('PromptsService', () => {
	let service: PromptsService;
	let promptRepository: jest.Mocked<EntityRepository<AIPrompt>>;
	let tagRepository: jest.Mocked<EntityRepository<PromptTag>>;
	let entityManager: jest.Mocked<EntityManager>;

	const mockUserId = 'test-user-id';
	const mockPromptData = {
		title: '睡眠引导提示词',
		content: '请帮我生成一个温柔的睡眠引导场景',
		category: PromptCategory.SLEEP_GUIDANCE,
	};

	beforeEach(async () => {
		// 模拟仓储对象
		const mockPromptRepository = {
			findOne: jest.fn(),
			findAndCount: jest.fn(),
			create: jest.fn(),
			getEntityManager: jest.fn(),
		};

		const mockTagRepository = {
			findOne: jest.fn(),
			findAndCount: jest.fn(),
			create: jest.fn(),
		};

		const mockEntityManager = {
			persistAndFlush: jest.fn(),
			removeAndFlush: jest.fn(),
			flush: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PromptsService,
				{
					provide: getRepositoryToken(AIPrompt),
					useValue: mockPromptRepository,
				},
				{
					provide: getRepositoryToken(PromptTag),
					useValue: mockTagRepository,
				},
				{
					provide: EntityManager,
					useValue: mockEntityManager,
				},
			],
		}).compile();

		service = module.get<PromptsService>(PromptsService);
		promptRepository = module.get(getRepositoryToken(AIPrompt));
		tagRepository = module.get(getRepositoryToken(PromptTag));
		entityManager = module.get<EntityManager>(EntityManager);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('应该正确初始化服务', () => {
		expect(service).toBeDefined();
	});

	describe('createPrompt', () => {
		it('应该成功创建提示词', async () => {
			const mockPrompt = new AIPrompt({
				userId: mockUserId,
				...mockPromptData,
			});

			promptRepository.create.mockReturnValue(mockPrompt);
			entityManager.persistAndFlush.mockResolvedValue(undefined);

			const result = await service.createPrompt(mockUserId, mockPromptData);

			expect(result).toBe(mockPrompt);
			expect(promptRepository.create).toHaveBeenCalledWith({
				userId: mockUserId,
				...mockPromptData,
			});
			expect(entityManager.persistAndFlush).toHaveBeenCalledWith(mockPrompt);
		});

		it('应该在标题为空时抛出异常', async () => {
			const invalidData = {...mockPromptData, title: ''};

			await expect(service.createPrompt(mockUserId, invalidData)).rejects.toThrow(BadRequestException);
		});

		it('应该在内容为空时抛出异常', async () => {
			const invalidData = {...mockPromptData, content: ''};

			await expect(service.createPrompt(mockUserId, invalidData)).rejects.toThrow(BadRequestException);
		});
	});

	describe('getPromptById', () => {
		it('应该根据ID获取提示词', async () => {
			const mockId = 'test-id';
			const mockPrompt = new AIPrompt({
				userId: mockUserId,
				...mockPromptData,
			});

			promptRepository.findOne.mockResolvedValue(mockPrompt);

			const result = await service.getPromptById(mockId, mockUserId);

			expect(result).toBe(mockPrompt);
			expect(promptRepository.findOne).toHaveBeenCalledWith({id: mockId, userId: mockUserId}, {populate: ['tags']});
		});

		it('应该在提示词不存在时抛出异常', async () => {
			promptRepository.findOne.mockResolvedValue(null);

			await expect(service.getPromptById('non-existent', mockUserId)).rejects.toThrow(NotFoundException);
		});
	});

	describe('getUserPrompts', () => {
		it('应该返回用户的提示词列表', async () => {
			const mockPrompts = [new AIPrompt({userId: mockUserId, ...mockPromptData})];

			promptRepository.findAndCount.mockResolvedValue([mockPrompts, 1]);

			const result = await service.getUserPrompts(mockUserId);

			expect(result.items).toHaveLength(1);
			expect(result.total).toBe(1);
			expect(promptRepository.findAndCount).toHaveBeenCalledWith(
				{userId: mockUserId},
				{
					populate: ['tags'],
					orderBy: {createdAt: 'DESC'},
					limit: 20,
					offset: 0,
				},
			);
		});

		it('应该支持分页和过滤', async () => {
			const filters = {
				category: PromptCategory.SLEEP_GUIDANCE,
				isPublic: true,
			};

			promptRepository.findAndCount.mockResolvedValue([[], 0]);

			await service.getUserPrompts(mockUserId, 10, 5, filters);

			expect(promptRepository.findAndCount).toHaveBeenCalledWith(
				{userId: mockUserId, ...filters},
				{
					populate: ['tags'],
					orderBy: {createdAt: 'DESC'},
					limit: 10,
					offset: 5,
				},
			);
		});
	});

	describe('updatePrompt', () => {
		it('应该成功更新提示词', async () => {
			const mockId = 'test-id';
			const mockPrompt = new AIPrompt({
				userId: mockUserId,
				...mockPromptData,
			});

			const updateData = {title: '更新的标题'};

			promptRepository.findOne.mockResolvedValue(mockPrompt);
			entityManager.flush.mockResolvedValue(undefined);

			const result = await service.updatePrompt(mockId, mockUserId, updateData);

			expect(result.title).toBe(updateData.title);
			expect(entityManager.flush).toHaveBeenCalled();
		});

		it('应该在提示词不存在时抛出异常', async () => {
			promptRepository.findOne.mockResolvedValue(null);

			await expect(service.updatePrompt('non-existent', mockUserId, {title: '新标题'})).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('deletePrompt', () => {
		it('应该成功删除提示词', async () => {
			const mockId = 'test-id';
			const mockPrompt = new AIPrompt({
				userId: mockUserId,
				...mockPromptData,
			});

			promptRepository.findOne.mockResolvedValue(mockPrompt);
			entityManager.removeAndFlush.mockResolvedValue(undefined);

			const result = await service.deletePrompt(mockId, mockUserId);

			expect(result).toBe(true);
			expect(entityManager.removeAndFlush).toHaveBeenCalledWith(mockPrompt);
		});

		it('应该在提示词不存在时返回false', async () => {
			promptRepository.findOne.mockResolvedValue(null);

			const result = await service.deletePrompt('non-existent', mockUserId);

			expect(result).toBe(false);
		});
	});

	describe('incrementUsageCount', () => {
		it('应该增加使用次数', async () => {
			const mockId = 'test-id';
			const mockPrompt = new AIPrompt({
				userId: mockUserId,
				...mockPromptData,
			});

			promptRepository.findOne.mockResolvedValue(mockPrompt);
			entityManager.flush.mockResolvedValue(undefined);

			await service.incrementUsageCount(mockId);

			expect(mockPrompt.usageCount).toBe(1);
			expect(entityManager.flush).toHaveBeenCalled();
		});
	});

	describe('getPublicPrompts', () => {
		it('应该返回公开的提示词', async () => {
			const mockPrompts = [
				new AIPrompt({
					userId: 'another-user',
					...mockPromptData,
					isPublic: true,
				}),
			];

			promptRepository.findAndCount.mockResolvedValue([mockPrompts, 1]);

			const result = await service.getPublicPrompts();

			expect(result.items).toHaveLength(1);
			expect(promptRepository.findAndCount).toHaveBeenCalledWith(
				{isPublic: true},
				{
					populate: ['tags'],
					orderBy: {usageCount: 'DESC', createdAt: 'DESC'},
					limit: 20,
					offset: 0,
				},
			);
		});
	});

	describe('createTag', () => {
		it('应该成功创建标签', async () => {
			const tagData = {name: '放松', category: '情绪'};
			const mockTag = new PromptTag(tagData);

			tagRepository.create.mockReturnValue(mockTag);
			entityManager.persistAndFlush.mockResolvedValue(undefined);

			const result = await service.createTag(tagData);

			expect(result).toBe(mockTag);
			expect(tagRepository.create).toHaveBeenCalledWith(tagData);
		});

		it('应该在标签名为空时抛出异常', async () => {
			await expect(service.createTag({name: ''})).rejects.toThrow(BadRequestException);
		});
	});

	describe('addTagToPrompt', () => {
		it('应该成功为提示词添加标签', async () => {
			const mockPrompt = new AIPrompt({
				userId: mockUserId,
				...mockPromptData,
			});
			const mockTag = new PromptTag({name: '放松'});

			promptRepository.findOne.mockResolvedValue(mockPrompt);
			tagRepository.findOne.mockResolvedValue(mockTag);
			entityManager.flush.mockResolvedValue(undefined);

			await service.addTagToPrompt('prompt-id', 'tag-id', mockUserId);

			expect(mockPrompt.tags.add).toHaveBeenCalledWith(mockTag);
			expect(entityManager.flush).toHaveBeenCalled();
		});

		it('应该在提示词不存在时抛出异常', async () => {
			promptRepository.findOne.mockResolvedValue(null);

			await expect(service.addTagToPrompt('non-existent', 'tag-id', mockUserId)).rejects.toThrow(NotFoundException);
		});
	});

	describe('getAllTags', () => {
		it('应该返回所有标签', async () => {
			const mockTags = [new PromptTag({name: '放松'}), new PromptTag({name: '睡眠'})];

			tagRepository.findAndCount.mockResolvedValue([mockTags, 2]);

			const result = await service.getAllTags();

			expect(result.items).toHaveLength(2);
			expect(result.total).toBe(2);
		});
	});
});
