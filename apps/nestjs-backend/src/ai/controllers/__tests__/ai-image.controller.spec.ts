import {Test, type TestingModule} from '@nestjs/testing';
import {HttpException, HttpStatus} from '@nestjs/common';
import {AIImageController} from '../ai-image.controller';
import {AIImageService} from '../../services/ai-image.service';
import {type GenerateImageDto, type BatchGenerateImageDto, type RegenerateImageDto} from '../../dto/generate-image.dto';
import {AssetType, UploadSource} from '../../../common/enums';

describe('AIImageController', () => {
	let controller: AIImageController;
	let service: AIImageService;

	// Mock data
	const mockUserId = 'test-user-id';
	const mockRequest = {
		user: {id: mockUserId},
	} as any;

	const mockAsset = {
		id: 'test-asset-id',
		userId: 'test-user-id',
		fileName: 'test-image.jpg',
		originalName: 'test-image.jpg',
		filePath: '/path/to/test-image.jpg',
		fileSize: 1024,
		mimeType: 'image/jpeg',
		assetType: AssetType.AI_GENERATED_IMAGE,
		uploadSource: UploadSource.AI_GENERATED,
		tags: [],
		metadata: {},
		url: 'https://image.pollinations.ai/test-image.jpg',
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const mockGenerationResult = {
		id: 'test-id',
		imageUrl: 'https://image.pollinations.ai/test-image.jpg',
		prompt: 'test prompt',
		seed: 1234,
		status: 'completed' as const,
		asset: mockAsset,
	};

	const mockTemplates = {
		nature: {
			title: '自然景观',
			description: '宁静的自然场景',
			templates: ['peaceful forest', 'mountain lake'],
		},
		cozy: {
			title: '温馨环境',
			description: '温暖舒适的室内场景',
			templates: ['warm fireplace', 'cozy reading nook'],
		},
		abstract: {
			title: '抽象艺术',
			description: '柔和的抽象图案和色彩',
			templates: ['soft flowing waves', 'gentle abstract patterns'],
		},
		zen: {
			title: '禅意空间',
			description: '简约禅意的场景设计',
			templates: ['minimalist zen garden', 'meditation space'],
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AIImageController],
			providers: [
				{
					provide: AIImageService,
					useValue: {
						generateImage: jest.fn(),
						batchGenerateImages: jest.fn(),
						regenerateImage: jest.fn(),
						getASMRTemplates: jest.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<AIImageController>(AIImageController);
		service = module.get<AIImageService>(AIImageService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('generateImage', () => {
		it('should generate image successfully', async () => {
			const dto: GenerateImageDto = {
				prompt: 'peaceful forest stream',
				seed: 1234,
				width: 1024,
				height: 1024,
				saveToAsset: true,
			};

			jest.spyOn(service, 'generateImage').mockResolvedValue(mockGenerationResult);

			const result = await controller.generateImage(dto, mockRequest);

			expect(service.generateImage).toHaveBeenCalledWith(dto, mockUserId);
			expect(result).toEqual({
				success: true,
				data: mockGenerationResult,
				message: '图片生成成功',
			});
		});

		it('should throw error when generation fails', async () => {
			const dto: GenerateImageDto = {
				prompt: 'test prompt',
			};

			const failedResult = {
				...mockGenerationResult,
				status: 'failed' as const,
				error: 'Generation failed',
			};

			jest.spyOn(service, 'generateImage').mockResolvedValue(failedResult);

			await expect(controller.generateImage(dto, mockRequest))
				.rejects
				.toThrow(new HttpException('图片生成失败: Generation failed', HttpStatus.INTERNAL_SERVER_ERROR));
		});

		it('should throw error when user is not authenticated', async () => {
			const dto: GenerateImageDto = {
				prompt: 'test prompt',
			};

			const unauthenticatedRequest = {user: null} as any;

			await expect(controller.generateImage(dto, unauthenticatedRequest))
				.rejects
				.toThrow(new HttpException('用户未认证', HttpStatus.UNAUTHORIZED));
		});
	});

	describe('batchGenerateImages', () => {
		it('should batch generate images successfully', async () => {
			const dto: BatchGenerateImageDto = {
				prompts: ['prompt 1', 'prompt 2'],
				width: 1024,
				height: 1024,
				saveToAsset: true,
			};

			const batchResults = [
				{...mockGenerationResult, prompt: 'prompt 1'},
				{...mockGenerationResult, prompt: 'prompt 2'},
			];

			jest.spyOn(service, 'batchGenerateImages').mockResolvedValue(batchResults);

			const result = await controller.batchGenerateImages(dto, mockRequest);

			expect(service.batchGenerateImages).toHaveBeenCalledWith(
				dto.prompts,
				mockUserId,
				{
					width: dto.width,
					height: dto.height,
					saveToAsset: dto.saveToAsset,
					projectId: dto.projectId,
				},
			);

			expect(result).toEqual({
				success: true,
				data: batchResults,
				message: '成功生成 2 张图片',
			});
		});

		it('should throw error when too many prompts provided', async () => {
			const dto: BatchGenerateImageDto = {
				prompts: Array.from({length: 11}, () => 'test prompt'), // 11 prompts, exceeds limit of 10
			};

			await expect(controller.batchGenerateImages(dto, mockRequest))
				.rejects
				.toThrow(new HttpException('一次最多只能生成10张图片', HttpStatus.BAD_REQUEST));
		});
	});

	describe('regenerateImage', () => {
		it('should regenerate image successfully', async () => {
			const dto: RegenerateImageDto = {
				originalPrompt: 'original prompt',
				width: 1024,
				height: 1024,
				saveToAsset: true,
			};

			jest.spyOn(service, 'regenerateImage').mockResolvedValue(mockGenerationResult);

			const result = await controller.regenerateImage(dto, mockRequest);

			expect(service.regenerateImage).toHaveBeenCalledWith(
				dto.originalPrompt,
				mockUserId,
				{
					width: dto.width,
					height: dto.height,
					saveToAsset: dto.saveToAsset,
				},
			);

			expect(result).toEqual({
				success: true,
				data: mockGenerationResult,
				message: '图片重新生成成功',
			});
		});

		it('should throw error when regeneration fails', async () => {
			const dto: RegenerateImageDto = {
				originalPrompt: 'original prompt',
			};

			const failedResult = {
				...mockGenerationResult,
				status: 'failed' as const,
				error: 'Regeneration failed',
			};

			jest.spyOn(service, 'regenerateImage').mockResolvedValue(failedResult);

			await expect(controller.regenerateImage(dto, mockRequest))
				.rejects
				.toThrow(new HttpException('重新生成失败: Regeneration failed', HttpStatus.INTERNAL_SERVER_ERROR));
		});
	});

	describe('getASMRTemplates', () => {
		it('should get ASMR templates successfully', async () => {
			jest.spyOn(service, 'getASMRTemplates').mockReturnValue(mockTemplates);

			const result = await controller.getASMRTemplates();

			expect(service.getASMRTemplates).toHaveBeenCalled();
			expect(result).toEqual({
				success: true,
				data: mockTemplates,
				message: '模板获取成功',
			});
		});
	});
});
