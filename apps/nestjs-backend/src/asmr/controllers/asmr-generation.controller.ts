import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Delete,
	UseGuards,
	Req,
	Res,
	Sse,
	MessageEvent,
	HttpCode,
	HttpStatus,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common';
import {Request, Response} from 'express';
import {ActiveUser} from '../../auth/types/active-user.type';
import {JwtAuthGuard} from '../../auth/jwt-auth.guard';
import {ASMRGenerationService} from '../services/asmr-generation.service';
import {ASMRPresetService} from '../services/asmr-preset.service';
import {
	GenerateASMRDto,
	ASMRGenerationRequest,
	ASMRGenerationResponse,
	ASMRPreset,
	ASMRProgress,
	CostEstimation,
	GenerationStatus,
} from '../dto/asmr-generation.dto';
import {Observable, map} from 'rxjs';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth} from '@nestjs/swagger';

@ApiTags('ASMR Generation')
@ApiBearerAuth()
@Controller('asmr')
@UseGuards(JwtAuthGuard)
export class ASMRGenerationController {
	constructor(
		private readonly asmrGenerationService: ASMRGenerationService,
		private readonly asmrPresetService: ASMRPresetService,
	) {}

	@Post('generate')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({summary: 'Generate ASMR audio content'})
	@ApiResponse({status: 201, description: 'Generation started successfully'})
	@ApiResponse({status: 400, description: 'Invalid request data'})
	async generateASMR(@Body() generateDto: GenerateASMRDto, @Req() request: Request): Promise<ASMRGenerationResponse> {
		const {userId} = request.user as ActiveUser;

		const generationRequest: ASMRGenerationRequest = {
			...generateDto,
			userId,
		};

		const result = await this.asmrGenerationService.generateASMR(generationRequest);

		return {
			generationId: result.generationId,
			status: GenerationStatus.PROCESSING,
			estimatedDuration: result.estimatedDuration,
			cost: result.cost,
			downloadUrl: `/asmr/${result.generationId}/download`,
			progressUrl: `/asmr/${result.generationId}/progress`,
		};
	}

	@Get('estimate-cost')
	@ApiOperation({summary: 'Estimate generation cost'})
	@ApiResponse({status: 200, description: 'Cost estimation calculated'})
	async estimateCost(@Body() estimateDto: Omit<GenerateASMRDto, 'title'>): Promise<CostEstimation> {
		return this.asmrGenerationService.estimateCost(estimateDto);
	}

	@Get('presets')
	@ApiOperation({summary: 'Get available presets'})
	@ApiResponse({status: 200, description: 'Presets retrieved successfully'})
	async getPresets(): Promise<ASMRPreset[]> {
		return this.asmrPresetService.getAllPresets();
	}

	@Get('presets/:type')
	@ApiOperation({summary: 'Get presets by type'})
	@ApiResponse({status: 200, description: 'Presets retrieved successfully'})
	async getPresetsByType(@Param('type') type: 'voice' | 'soundscape' | 'mixing'): Promise<ASMRPreset[]> {
		return this.asmrPresetService.getPresetsByType(type);
	}

	@Get(':id/progress')
	@Sse()
	@ApiOperation({summary: 'Stream generation progress'})
	@ApiResponse({status: 200, description: 'Progress stream established'})
	streamProgress(@Param('id') id: string): Observable<MessageEvent> {
		return this.asmrGenerationService.getProgressStream(id).pipe(
			map((progress: ASMRProgress) => ({
				data: progress,
				type: 'progress',
			})),
		);
	}

	@Get(':id/status')
	@ApiOperation({summary: 'Get generation status'})
	@ApiResponse({status: 200, description: 'Status retrieved successfully'})
	async getGenerationStatus(@Param('id') id: string): Promise<{
		status: GenerationStatus;
		progress: number;
		result?: any;
		error?: string;
	}> {
		const result = await this.asmrGenerationService.getGenerationStatus(id);

		if (!result) {
			throw new NotFoundException('Generation not found');
		}

		return result;
	}

	@Get(':id/download')
	@ApiOperation({summary: 'Download generated ASMR file'})
	@ApiResponse({status: 200, description: 'File download initiated'})
	async downloadGenerated(@Param('id') id: string, @Res() response: Response): Promise<void> {
		const result = await this.asmrGenerationService.getGenerationResult(id);

		if (!result?.filePath) {
			throw new NotFoundException('Generated file not found');
		}

		response.setHeader('Content-Type', 'audio/mpeg');
		response.setHeader('Content-Disposition', `attachment; filename="${result.title}.mp3"`);
		response.sendFile(result.filePath);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({summary: 'Cancel generation'})
	@ApiResponse({status: 204, description: 'Generation cancelled successfully'})
	async cancelGeneration(@Param('id') id: string): Promise<void> {
		await this.asmrGenerationService.cancelGeneration(id);
	}

	@Get('recent')
	@ApiOperation({summary: 'Get recent generations'})
	@ApiResponse({status: 200, description: 'Recent generations retrieved'})
	async getRecentGenerations(@Req() request: Request): Promise<ASMRGenerationResponse[]> {
		const {userId} = request.user as ActiveUser;
		return this.asmrGenerationService.getRecentGenerations(userId);
	}

	@Post('validate')
	@ApiOperation({summary: 'Validate generation parameters'})
	@ApiResponse({status: 200, description: 'Parameters validated successfully'})
	async validateParameters(@Body() validateDto: GenerateASMRDto): Promise<{
		valid: boolean;
		issues?: string[];
		suggestions?: string[];
	}> {
		return this.asmrGenerationService.validateParameters(validateDto);
	}
}
