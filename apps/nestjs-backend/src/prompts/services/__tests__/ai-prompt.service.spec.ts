import {Test, type TestingModule} from '@nestjs/testing';
import {BadRequestException, NotFoundException} from '@nestjs/common';
import {getRepositoryToken} from '@mikro-orm/nestjs';
import {type EntityRepository} from '@mikro-orm/core';
import {AIPromptService} from '../ai-prompt.service';
import {AIPrompt} from '../../entities/prompt.entity';
import {PromptTag} from '../../entities/prompt-tag.entity';
import {PromptCategory} from '../../../common/enums/prompt-category.enum';

describe('AIPromptService', () => {
	let service: AIPromptService;
	let promptRepository: jest.Mocked<EntityRepository<AIPrompt>>;
	let tagRepository: jest.Mocked<EntityRepository<PromptTag>>;

	// Mock data
	const mockUserId = 'test-user-id';
	const mockPromptId = 'test-prompt-id';
	const mockTagId = 'test-tag-id';

	const mockPrompt = {
		id: mockPromptId,
		userId: mockUserId,
		title: 'Test Prompt',
		content: 'Test content',
		category: PromptCategory.MEDITATION,
		isPublic: false,
		isAiGenerated: false,
		usageCount: 0,
		rating: 0,
		tags: {
			contains: jest.fn(),
			add: jest.fn(),
			removeAll: jest.fn(),
		},
		createdAt: new Date(),
		updatedAt: new Date(),
	} as unknown as AIPrompt;

	const mockTag = {
		id: mockTagId,
		name: 'test-tag',
		category: 'meditation',
		color: '#3B82F6',
		usageCount: 1,
	} as PromptTag;

	// Mock repository methods
	const mockPromptRepository = {
		persistAndFlush: jest.fn(),
		findOne: jest.fn(),
		findAndCount: jest.fn(),
		removeAndFlush: jest.fn(),
		getEntityManager: jest.fn(() => ({
			getConnection: jest.fn(() => ({
				execute: jest.fn(),
			})),
		})),
	};

	const mockTagRepository = {
		persistAndFlush: jest.fn(),
		findOne: jest.fn(),
		find: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AIPromptService,
				{
					provide: getRepositoryToken(AIPrompt),
					useValue: mockPromptRepository,
				},
				{
					provide: getRepositoryToken(PromptTag),
					useValue: mockTagRepository,
				},
			],
		}).compile();

		service = module.get<AIPromptService>(AIPromptService);
		promptRepository = module.get(getRepositoryToken(AIPrompt));
		tagRepository = module.get(getRepositoryToken(PromptTag));

		// Reset all mocks before each test
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('createPrompt', () => {
		const createData = {
			userId: mockUserId,
			title: 'Test Prompt',
			content: 'Test content',
			category: PromptCategory.MEDITATION,
			isPublic: false,
			tags: ['test-tag'],
		};

		it('should create a prompt successfully', async () => {
			// Arrange
			promptRepository.persistAndFlush.mockResolvedValue(undefined);
			tagRepository.findOne.mockResolvedValue(mockTag);
			mockPrompt.tags.contains.mockReturnValue(false);

			// Act
			const result = await service.createPrompt(createData);

			// Assert
			expect(promptRepository.persistAndFlush).toHaveBeenCalled();
			expect(result).toBeInstanceOf(AIPrompt);
		});

		it('should throw BadRequestException when title is empty', async () => {
			// Arrange
			const invalidData = {...createData, title: ''};

			// Act & Assert
			await expect(service.createPrompt(invalidData)).rejects.toThrow(
				new BadRequestException('提示词标题不能为空'),
			);
		});

		it('should throw BadRequestException when content is empty', async () => {
			// Arrange
			const invalidData = {...createData, content: ''};

			// Act & Assert
			await expect(service.createPrompt(invalidData)).rejects.toThrow(
				new BadRequestException('提示词内容不能为空'),
			);
		});

		it('should throw BadRequestException when title is too long', async () => {
			// Arrange
			const longTitle = 'a'.repeat(256); // 超过255字符限制
			const invalidData = {...createData, title: longTitle};

			// Act & Assert
			await expect(service.createPrompt(invalidData)).rejects.toThrow(
				new BadRequestException('提示词标题长度不能超过255个字符'),
			);
		});

		it('should throw BadRequestException when content is too long', async () => {
			// Arrange
			const longContent = 'a'.repeat(5001); // 超过5000字符限制
			const invalidData = {...createData, content: longContent};

			// Act & Assert
			await expect(service.createPrompt(invalidData)).rejects.toThrow(
				new BadRequestException('提示词内容长度不能超过5000个字符'),
			);
		});

		it('should create new tag when tag does not exist', async () => {
			// Arrange
			promptRepository.persistAndFlush.mockResolvedValue(undefined);
			tagRepository.findOne.mockResolvedValue(null);
			tagRepository.persistAndFlush.mockResolvedValue(undefined);
			mockPrompt.tags.contains.mockReturnValue(false);

			// Act
			await service.createPrompt(createData);

			// Assert
			expect(tagRepository.findOne).toHaveBeenCalledWith({name: 'test-tag'});
			expect(tagRepository.persistAndFlush).toHaveBeenCalled();
		});
	});

	describe('getUserPrompts', () => {
		it('should return user prompts with pagination', async () => {
			// Arrange
			const options = {
				category: PromptCategory.MEDITATION,
				limit: 10,
				offset: 0,
			};

			const mockResults = [[mockPrompt], 1] as [AIPrompt[], number];
			promptRepository.findAndCount.mockResolvedValue(mockResults);

			// Act
			const result = await service.getUserPrompts(mockUserId, options);

			// Assert
			expect(promptRepository.findAndCount).toHaveBeenCalledWith(
				{
					userId: mockUserId,
					category: PromptCategory.MEDITATION,
				},
				{
					populate: ['tags'],
					orderBy: {createdAt: 'DESC'},
					limit: 10,
					offset: 0,
				},
			);
			expect(result).toEqual({items: [mockPrompt], total: 1});
		});

		it('should support search functionality', async () => {
			// Arrange
			const options = {
				search: 'meditation',
				limit: 20,
				offset: 0,
			};

			const mockResults = [[mockPrompt], 1] as [AIPrompt[], number];
			promptRepository.findAndCount.mockResolvedValue(mockResults);

			// Act
			const result = await service.getUserPrompts(mockUserId, options);

			// Assert
			expect(promptRepository.findAndCount).toHaveBeenCalledWith(
				{
					userId: mockUserId,
					$or: [
						{title: {$ilike: '%meditation%'}},
						{content: {$ilike: '%meditation%'}},
					],
				},
				expect.objectContaining({
					populate: ['tags'],
					orderBy: {createdAt: 'DESC'},
				}),
			);
			expect(result).toEqual({items: [mockPrompt], total: 1});
		});
	});

	describe('getPromptById', () => {
		it('should return prompt when it exists and user has access', async () => {
			// Arrange
			promptRepository.findOne.mockResolvedValue(mockPrompt);

			// Act
			const result = await service.getPromptById(mockPromptId, mockUserId);

			// Assert
			expect(promptRepository.findOne).toHaveBeenCalledWith(
				{
					id: mockPromptId,
					$or: [
						{userId: mockUserId},
						{isPublic: true},
					],
				},
				{
					populate: ['tags'],
				},
			);
			expect(result).toEqual(mockPrompt);
		});

		it('should throw NotFoundException when prompt does not exist', async () => {
			// Arrange
			promptRepository.findOne.mockResolvedValue(null);

			// Act & Assert
			await expect(service.getPromptById('non-existent-id', mockUserId)).rejects.toThrow(
				new NotFoundException('提示词不存在或无访问权限'),
			);
		});
	});

	describe('updatePrompt', () => {
		const updateData = {
			title: 'Updated Title',
			content: 'Updated content',
			category: PromptCategory.RELAXATION,
			tags: ['updated-tag'],
		};

		it('should update prompt successfully', async () => {
			// Arrange
			promptRepository.findOne.mockResolvedValue(mockPrompt);
			promptRepository.persistAndFlush.mockResolvedValue(undefined);
			tagRepository.findOne.mockResolvedValue(mockTag);
			mockPrompt.tags.contains.mockReturnValue(false);

			// Act
			const result = await service.updatePrompt(mockPromptId, mockUserId, updateData);

			// Assert
			expect(promptRepository.findOne).toHaveBeenCalledWith({
				id: mockPromptId,
				userId: mockUserId,
			});
			expect(mockPrompt.tags.removeAll).toHaveBeenCalled();
			expect(promptRepository.persistAndFlush).toHaveBeenCalledWith(mockPrompt);
			expect(result).toEqual(mockPrompt);
		});

		it('should throw NotFoundException when prompt does not exist', async () => {
			// Arrange
			promptRepository.findOne.mockResolvedValue(null);

			// Act & Assert
			await expect(service.updatePrompt('non-existent-id', mockUserId, updateData)).rejects.toThrow(
				new NotFoundException('提示词不存在或无修改权限'),
			);
		});

		it('should throw BadRequestException when updated title is empty', async () => {
			// Arrange
			promptRepository.findOne.mockResolvedValue(mockPrompt);
			const invalidUpdateData = {...updateData, title: ''};

			// Act & Assert
			await expect(service.updatePrompt(mockPromptId, mockUserId, invalidUpdateData)).rejects.toThrow(
				new BadRequestException('提示词标题不能为空'),
			);
		});
	});

	describe('deletePrompt', () => {
		it('should delete prompt successfully', async () => {
			// Arrange
			promptRepository.findOne.mockResolvedValue(mockPrompt);
			promptRepository.removeAndFlush.mockResolvedValue(undefined);

			// Act
			const result = await service.deletePrompt(mockPromptId, mockUserId);

			// Assert
			expect(promptRepository.findOne).toHaveBeenCalledWith({
				id: mockPromptId,
				userId: mockUserId,
			});
			expect(promptRepository.removeAndFlush).toHaveBeenCalledWith(mockPrompt);
			expect(result).toBe(true);
		});

		it('should return false when prompt does not exist', async () => {
			// Arrange
			promptRepository.findOne.mockResolvedValue(null);

			// Act
			const result = await service.deletePrompt('non-existent-id', mockUserId);

			// Assert
			expect(result).toBe(false);
		});
	});

	describe('incrementUsageCount', () => {
		it('should increment usage count successfully', async () => {
			// Arrange
			const mockPromptWithCount = {...mockPrompt, usageCount: 5};
			promptRepository.findOne.mockResolvedValue(mockPromptWithCount);
			promptRepository.persistAndFlush.mockResolvedValue(undefined);

			// Act
			const result = await service.incrementUsageCount(mockPromptId);

			// Assert
			expect(promptRepository.findOne).toHaveBeenCalledWith({id: mockPromptId});
			expect(mockPromptWithCount.usageCount).toBe(6);
			expect(promptRepository.persistAndFlush).toHaveBeenCalledWith(mockPromptWithCount);
			expect(result).toEqual(mockPromptWithCount);
		});

		it('should throw NotFoundException when prompt does not exist', async () => {
			// Arrange
			promptRepository.findOne.mockResolvedValue(null);

			// Act & Assert
			await expect(service.incrementUsageCount('non-existent-id')).rejects.toThrow(
				new NotFoundException('提示词不存在'),
			);
		});
	});

	describe('getPopularTags', () => {
		it('should return popular tags', async () => {
			// Arrange
			const mockTags = [mockTag];
			tagRepository.find.mockResolvedValue(mockTags);

			// Act
			const result = await service.getPopularTags(10);

			// Assert
			expect(tagRepository.find).toHaveBeenCalledWith(
				{},
				{
					orderBy: {usageCount: 'DESC'},
					limit: 10,
				},
			);
			expect(result).toEqual(mockTags);
		});

		it('should return empty array on error', async () => {
			// Arrange
			tagRepository.find.mockRejectedValue(new Error('Database error'));

			// Act
			const result = await service.getPopularTags();

			// Assert
			expect(result).toEqual([]);
		});
	});

	describe('getPromptStatsByCategory', () => {
		it('should return category statistics for user', async () => {
			// Arrange
			const mockStats = [
				{category: PromptCategory.MEDITATION, count: 5},
				{category: PromptCategory.RELAXATION, count: 3},
			];

			const mockConnection = {
				execute: jest.fn().mockResolvedValue([
					{category: 'meditation', count: '5'},
					{category: 'relaxation', count: '3'},
				]),
			};

			mockPromptRepository.getEntityManager.mockReturnValue({
				getConnection: () => mockConnection,
			});

			// Act
			const result = await service.getPromptStatsByCategory(mockUserId);

			// Assert
			expect(mockConnection.execute).toHaveBeenCalledWith(
				expect.stringContaining('WHERE user_id = ?'),
				[mockUserId],
			);
			expect(result).toEqual(mockStats);
		});

		it('should return global statistics when no userId provided', async () => {
			// Arrange
			const mockConnection = {
				execute: jest.fn().mockResolvedValue([
					{category: 'meditation', count: '10'},
				]),
			};

			mockPromptRepository.getEntityManager.mockReturnValue({
				getConnection: () => mockConnection,
			});

			// Act
			const result = await service.getPromptStatsByCategory();

			// Assert
			expect(mockConnection.execute).toHaveBeenCalledWith(
				expect.not.stringContaining('WHERE user_id = ?'),
				[],
			);
			expect(result).toEqual([{category: PromptCategory.MEDITATION, count: 10}]);
		});

		it('should return empty array on error', async () => {
			// Arrange
			mockPromptRepository.getEntityManager.mockImplementation(() => {
				throw new Error('Database error');
			});

			// Act
			const result = await service.getPromptStatsByCategory(mockUserId);

			// Assert
			expect(result).toEqual([]);
		});
	});
});
