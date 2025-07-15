import {Controller, Post, Get, Body, UseGuards, Req, HttpStatus, HttpException, ValidationPipe, UsePipes} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth} from '@nestjs/swagger';
import {JwtAuthGuard} from '../../auth/jwt-auth.guard';
import {AIImageService} from '../services/ai-image.service';
import {GenerateImageDto, BatchGenerateImageDto, RegenerateImageDto} from '../dto/generate-image.dto';
import {Request} from 'express';

@ApiTags('AI图片生成')
@Controller('ai-image')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({transform: true, whitelist: true}))
@ApiBearerAuth()
export class AIImageController {
	constructor(private readonly aiImageService: AIImageService) {}

	@Post('generate')
	@ApiOperation({
		summary: '生成AI图片',
		description: '根据提示词生成AI图片，支持保存到Asset系统',
	})
	@ApiResponse({
		status: 200,
		description: '图片生成成功',
		schema: {
			type: 'object',
			properties: {
				id: {type: 'string', description: '生成任务ID'},
				imageUrl: {type: 'string', description: '生成的图片URL'},
				prompt: {type: 'string', description: '生成提示词'},
				seed: {type: 'number', description: '随机种子'},
				status: {type: 'string', enum: ['pending', 'completed', 'failed'], description: '生成状态'},
				asset: {type: 'object', description: 'Asset实体信息（如果保存到Asset系统）'},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: '请求参数错误',
	})
	@ApiResponse({
		status: 401,
		description: '未授权访问',
	})
	async generateImage(@Body() dto: GenerateImageDto, @Req() req: Request) {
		const userId = this.getUserId(req);
		const result = await this.aiImageService.generateImage(dto, userId);

		if (result.status === 'failed') {
			throw new HttpException(
				`图片生成失败: ${result.error}`,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		return {
			success: true,
			data: result,
			message: '图片生成成功',
		};
	}

	@Post('batch-generate')
	@ApiOperation({
		summary: '批量生成AI图片',
		description: '根据多个提示词批量生成AI图片',
	})
	@ApiResponse({
		status: 200,
		description: '批量生成成功',
		schema: {
			type: 'object',
			properties: {
				success: {type: 'boolean'},
				data: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: {type: 'string'},
							imageUrl: {type: 'string'},
							prompt: {type: 'string'},
							seed: {type: 'number'},
							status: {type: 'string'},
							asset: {type: 'object'},
						},
					},
				},
				message: {type: 'string'},
			},
		},
	})
	async batchGenerateImages(@Body() dto: BatchGenerateImageDto, @Req() req: Request) {
		const userId = this.getUserId(req);

		if (dto.prompts.length > 10) {
			throw new HttpException('一次最多只能生成10张图片', HttpStatus.BAD_REQUEST);
		}

		const results = await this.aiImageService.batchGenerateImages(
			dto.prompts,
			userId,
			{
				width: dto.width,
				height: dto.height,
				saveToAsset: dto.saveToAsset,
				projectId: dto.projectId,
			},
		);

		return {
			success: true,
			data: results,
			message: `成功生成 ${results.filter(r => r.status === 'completed').length} 张图片`,
		};
	}

	@Post('regenerate')
	@ApiOperation({
		summary: '重新生成AI图片',
		description: '使用新的随机种子重新生成图片',
	})
	@ApiResponse({
		status: 200,
		description: '重新生成成功',
	})
	async regenerateImage(@Body() dto: RegenerateImageDto, @Req() req: Request) {
		const userId = this.getUserId(req);

		const result = await this.aiImageService.regenerateImage(
			dto.originalPrompt,
			userId,
			{
				width: dto.width,
				height: dto.height,
				saveToAsset: dto.saveToAsset,
			},
		);

		if (result.status === 'failed') {
			throw new HttpException(
				`重新生成失败: ${result.error}`,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		return {
			success: true,
			data: result,
			message: '图片重新生成成功',
		};
	}

	@Get('templates')
	@ApiOperation({
		summary: '获取ASMR场景模板',
		description: '获取预设的ASMR场景提示词模板',
	})
	@ApiResponse({
		status: 200,
		description: '模板获取成功',
		schema: {
			type: 'object',
			properties: {
				success: {type: 'boolean'},
				data: {
					type: 'object',
					additionalProperties: {
						type: 'object',
						properties: {
							title: {type: 'string'},
							description: {type: 'string'},
							templates: {type: 'array', items: {type: 'string'}},
						},
					},
				},
				message: {type: 'string'},
			},
		},
	})
	async getASMRTemplates() {
		const templates = this.aiImageService.getASMRTemplates();
		return {
			success: true,
			data: templates,
			message: '模板获取成功',
		};
	}

	/**
	 * 从请求中提取用户ID的辅助方法
	 * @param req 请求对象
	 * @returns 用户ID
	 * @throws HttpException 如果用户未认证
	 */
	private getUserId(req: Request): string {
		const user = req.user as any;
		const userId = user?.id;
		if (!userId) {
			throw new HttpException('用户未认证', HttpStatus.UNAUTHORIZED);
		}

		return userId;
	}
}
