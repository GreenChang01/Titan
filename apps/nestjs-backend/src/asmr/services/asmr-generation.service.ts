import {Injectable, BadRequestException, NotFoundException, Logger} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository} from '@mikro-orm/core';
import {Subject, Observable, BehaviorSubject} from 'rxjs';
import {
	ASMRGenerationRequest,
	ASMRGenerationResponse,
	ASMRProgress,
	CostEstimation,
	GenerationStatus,
	VoiceType,
	SoundscapeType,
	GenerateASMRDto,
} from '../dto/asmr-generation.dto';
import {ASMRContentService} from './asmr-content.service';
import {ElevenLabsProvider} from '../providers/elevenlabs.provider';
import {ASMRGeneration} from '../entities/asmr-generation.entity';
import {User} from '../../users/entities/user.entity';

@Injectable()
export class ASMRGenerationService {
	private readonly logger = new Logger(ASMRGenerationService.name);
	private readonly progressStreams = new Map<string, BehaviorSubject<ASMRProgress>>();
	private readonly generationResults = new Map<string, any>();

	constructor(
		@InjectRepository(ASMRGeneration)
		private readonly asmrGenerationRepository: EntityRepository<ASMRGeneration>,
		private readonly asmrContentService: ASMRContentService,
		private readonly elevenLabsProvider: ElevenLabsProvider,
	) {}

	async generateASMR(request: ASMRGenerationRequest): Promise<ASMRGenerationResponse> {
		this.logger.debug(`Starting ASMR generation for user ${request.userId}`);

		// Validate request parameters
		const validation = await this.validateParameters(request);
		if (!validation.valid) {
			throw new BadRequestException(`Invalid parameters: ${validation.issues?.join(', ')}`);
		}

		// Calculate cost estimation
		const costEstimation = await this.estimateCost(request);

		// Get user entity
		const user = await this.asmrGenerationRepository.getEntityManager().findOne(User, request.userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		// Create generation record
		const generation = this.asmrGenerationRepository.create({
			title: request.title,
			content: request.content,
			description: request.description,
			user,
			voiceSettings: request.voice,
			soundscapeSettings: request.soundscape,
			mixingSettings: request.mixing || {},
			tags: request.tags || [],
			isPrivate: request.isPrivate ?? true,
			cost: costEstimation.totalCost,
			estimatedDuration: costEstimation.estimatedDuration,
			playCount: 0,
			status: GenerationStatus.PENDING,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await this.asmrGenerationRepository.getEntityManager().persistAndFlush(generation);

		// Initialize progress stream
		const progressSubject = new BehaviorSubject<ASMRProgress>({
			generationId: generation.id,
			status: GenerationStatus.PENDING,
			progress: 0,
			currentStep: 'Initializing generation...',
			timestamp: new Date(),
		});

		this.progressStreams.set(generation.id, progressSubject);

		// Start generation process asynchronously
		this.processGeneration(generation).catch(error => {
			this.logger.error(`Generation failed for ${generation.id}:`, error);
			this.updateProgress(generation.id, {
				status: GenerationStatus.FAILED,
				progress: 0,
				currentStep: 'Generation failed',
				error: error.message,
			});
		});

		return {
			generationId: generation.id,
			status: GenerationStatus.PROCESSING,
			estimatedDuration: costEstimation.estimatedDuration,
			cost: costEstimation,
			downloadUrl: `/asmr/${generation.id}/download`,
			progressUrl: `/asmr/${generation.id}/progress`,
		};
	}

	private async processGeneration(generation: ASMRGeneration): Promise<void> {
		try {
			// Update to processing status
			await this.updateGenerationStatus(generation.id, GenerationStatus.PROCESSING);
			this.updateProgress(generation.id, {
				status: GenerationStatus.PROCESSING,
				progress: 10,
				currentStep: 'Preparing voice synthesis...',
				estimatedTimeRemaining: generation.estimatedDuration,
			});

			// Generate voice audio
			this.updateProgress(generation.id, {
				status: GenerationStatus.PROCESSING,
				progress: 30,
				currentStep: 'Generating voice audio...',
				estimatedTimeRemaining: generation.estimatedDuration * 0.7,
			});

			const voiceResult = await this.generateVoiceAudio(generation);

			// Generate soundscape
			this.updateProgress(generation.id, {
				status: GenerationStatus.PROCESSING,
				progress: 60,
				currentStep: 'Generating soundscape...',
				estimatedTimeRemaining: generation.estimatedDuration * 0.4,
			});

			const soundscapeResult = await this.generateSoundscape(generation);

			// Mix audio
			this.updateProgress(generation.id, {
				status: GenerationStatus.PROCESSING,
				progress: 80,
				currentStep: 'Mixing audio tracks...',
				estimatedTimeRemaining: generation.estimatedDuration * 0.2,
			});

			const finalResult = await this.mixAudio(generation, voiceResult, soundscapeResult ?? undefined);

			// Finalize
			this.updateProgress(generation.id, {
				status: GenerationStatus.PROCESSING,
				progress: 95,
				currentStep: 'Finalizing...',
				estimatedTimeRemaining: generation.estimatedDuration * 0.05,
			});

			// Save result
			await this.saveGenerationResult(generation.id, finalResult);

			// Complete
			await this.updateGenerationStatus(generation.id, GenerationStatus.COMPLETED);
			this.updateProgress(generation.id, {
				status: GenerationStatus.COMPLETED,
				progress: 100,
				currentStep: 'Generation completed successfully',
				estimatedTimeRemaining: 0,
			});

			this.logger.log(`Generation completed successfully: ${generation.id}`);
		} catch (error: any) {
			this.logger.error(`Generation failed: ${generation.id}`, error);
			await this.updateGenerationStatus(generation.id, GenerationStatus.FAILED);
			this.updateProgress(generation.id, {
				status: GenerationStatus.FAILED,
				progress: 0,
				currentStep: 'Generation failed',
				error: (error as Error)?.message || 'Unknown error',
			});
		}
	}

	private async generateVoiceAudio(generation: ASMRGeneration): Promise<string> {
		const voiceId = this.getVoiceIdFromType(generation.voiceSettings.type);

		return await this.elevenLabsProvider.generateSpeech({
			text: generation.content,
			voiceId,
			settings: {
				stability: generation.voiceSettings.stability || 0.5,
				similarityBoost: generation.voiceSettings.clarity || 0.75,
				style: 0.1, // Low style for ASMR
				useSpeakerBoost: false,
			},
		});
	}

	private async generateSoundscape(generation: ASMRGeneration): Promise<string | null> {
		if (generation.soundscapeSettings.type === SoundscapeType.NONE) {
			return null;
		}

		const soundscapePrompt = this.getSoundscapePrompt(generation.soundscapeSettings.type);

		return await this.elevenLabsProvider.generateSoundEffect({
			text: soundscapePrompt,
			durationSeconds: generation.estimatedDuration,
			promptInfluence: 0.3,
		});
	}

	private async mixAudio(generation: ASMRGeneration, voiceFile: string, soundscapeFile?: string): Promise<{
		filePath: string;
		duration: number;
		fileSize: number;
	}> {
		const mixingConfig = {
			voiceVolume: generation.voiceSettings.volume || 0.8,
			soundscapeVolume: generation.soundscapeSettings.volume || 0.3,
			masterVolume: generation.mixingSettings?.masterVolume || 0.8,
			binaural: generation.mixingSettings?.binaural || false,
			asmrFilter: generation.mixingSettings?.asmrFilter || true,
			elderlyOptimization: generation.mixingSettings?.elderlyOptimization || true,
		};

		return this.asmrContentService.mixAudio({
			voiceFile,
			soundscapeFile,
			outputPath: `generated/asmr_${generation.id}.mp3`,
			config: mixingConfig,
		});
	}

	private getVoiceIdFromType(voiceType: VoiceType): string {
		const voiceMap = {
			[VoiceType.GENTLE_FEMALE]: 'EXAVITQu4vr4xnSDxMaL', // Bella
			[VoiceType.WARM_MALE]: 'ErXwobaYiN019PkySvjV', // Antoni
			[VoiceType.ELDERLY_FEMALE]: 'MF3mGyEYCl7XYWbV9V6O', // Elli
			[VoiceType.ELDERLY_MALE]: 'VR6AewLTigWG4xSOukaG', // Arnold
			[VoiceType.CHILD_FRIENDLY]: 'AZnzlk1XvdvUeBnXmlld', // Domi
			[VoiceType.NARRATOR]: 'onwK4e9ZLuTAKqWW03F9', // Daniel
		};

		return voiceMap[voiceType] || voiceMap[VoiceType.GENTLE_FEMALE];
	}

	private getSoundscapePrompt(soundscapeType: SoundscapeType): string {
		const promptMap = {
			[SoundscapeType.NATURE]: 'Gentle nature sounds with birds chirping softly and leaves rustling',
			[SoundscapeType.RAIN]: 'Soft rain falling on leaves with distant thunder',
			[SoundscapeType.OCEAN]: 'Gentle ocean waves washing ashore repeatedly',
			[SoundscapeType.FOREST]: 'Peaceful forest ambiance with wind through trees',
			[SoundscapeType.FIREPLACE]: 'Warm fireplace crackling softly',
			[SoundscapeType.WHITE_NOISE]: 'Smooth white noise for relaxation',
			[SoundscapeType.BROWN_NOISE]: 'Deep brown noise for sleep',
			[SoundscapeType.BINAURAL]: 'Binaural beats at 40Hz for deep relaxation',
			[SoundscapeType.NONE]: '',
		};

		return promptMap[soundscapeType] || promptMap[SoundscapeType.NATURE];
	}

	async estimateCost(request: Omit<GenerateASMRDto, 'title'>): Promise<CostEstimation> {
		const characterCount = request.content.length;
		const estimatedDuration = Math.ceil(characterCount / 200 * 60); // ~200 chars per minute

		// ElevenLabs pricing estimation
		const voiceCost = Math.ceil(characterCount / 1000) * 0.3; // $0.30 per 1K characters
		const soundscapeCost = request.soundscape.type === SoundscapeType.NONE
			? 0
			: Math.ceil(estimatedDuration / 60) * 0.5; // $0.50 per minute
		const processingCost = 0.1; // Fixed processing cost

		const totalCost = voiceCost + soundscapeCost + processingCost;

		return {
			totalCost,
			voiceCost,
			soundscapeCost,
			processingCost,
			characterCount,
			estimatedDuration,
			breakdown: [
				{
					item: 'Voice Generation',
					cost: voiceCost,
					description: `${characterCount} characters at $0.30/1K`,
				},
				{
					item: 'Soundscape Generation',
					cost: soundscapeCost,
					description: soundscapeCost > 0 ? `${Math.ceil(estimatedDuration / 60)} minutes at $0.50/min` : 'No soundscape',
				},
				{
					item: 'Audio Processing',
					cost: processingCost,
					description: 'Mixing and optimization',
				},
			],
		};
	}

	async validateParameters(request: GenerateASMRDto): Promise<{
		valid: boolean;
		issues?: string[];
		suggestions?: string[];
	}> {
		const issues: string[] = [];
		const suggestions: string[] = [];

		// Validate content length
		if (request.content.length < 10) {
			issues.push('Content too short (minimum 10 characters)');
		}

		if (request.content.length > 10_000) {
			issues.push('Content too long (maximum 10,000 characters)');
		}

		// Validate voice settings
		if (request.voice.speed && (request.voice.speed < 0.5 || request.voice.speed > 2)) {
			issues.push('Voice speed must be between 0.5 and 2.0');
		}

		// Provide suggestions for optimization
		if (request.content.length > 5000) {
			suggestions.push('Consider breaking longer content into multiple generations for better results');
		}

		if (request.voice.speed && request.voice.speed > 1.5) {
			suggestions.push('Higher speech speeds may reduce ASMR effectiveness');
		}

		return {
			valid: issues.length === 0,
			issues: issues.length > 0 ? issues : undefined,
			suggestions: suggestions.length > 0 ? suggestions : undefined,
		};
	}

	getProgressStream(generationId: string): Observable<ASMRProgress> {
		const stream = this.progressStreams.get(generationId);
		if (!stream) {
			throw new NotFoundException('Generation not found');
		}

		return stream.asObservable();
	}

	async getGenerationStatus(generationId: string): Promise<{
		status: GenerationStatus;
		progress: number;
		result?: any;
		error?: string;
	} | null> {
		const generation = await this.asmrGenerationRepository.findOne({
			id: generationId,
		});

		if (!generation) {
			return null;
		}

		const progressStream = this.progressStreams.get(generationId);
		const currentProgress = progressStream?.value || {
			progress: 0,
			status: generation.status,
			currentStep: 'Unknown',
			timestamp: new Date(),
			error: undefined,
		};

		return {
			status: generation.status,
			progress: currentProgress.progress,
			result: generation.status === GenerationStatus.COMPLETED
				? this.generationResults.get(generationId)
				: undefined,
			error: currentProgress.error,
		};
	}

	async getGenerationResult(generationId: string): Promise<{
		filePath: string;
		title: string;
		duration: number;
		fileSize: number;
	} | null> {
		const generation = await this.asmrGenerationRepository.findOne({
			id: generationId,
		});

		if (!generation || generation.status !== GenerationStatus.COMPLETED) {
			return null;
		}

		const result = this.generationResults.get(generationId);
		if (!result) {
			return null;
		}

		return {
			filePath: result.filePath,
			title: generation.title,
			duration: result.duration,
			fileSize: result.fileSize,
		};
	}

	async cancelGeneration(generationId: string): Promise<void> {
		const generation = await this.asmrGenerationRepository.findOne({
			id: generationId,
		});

		if (!generation) {
			throw new NotFoundException('Generation not found');
		}

		if (generation.status === GenerationStatus.COMPLETED) {
			throw new BadRequestException('Cannot cancel completed generation');
		}

		await this.updateGenerationStatus(generationId, GenerationStatus.CANCELLED);
		this.updateProgress(generationId, {
			status: GenerationStatus.CANCELLED,
			progress: 0,
			currentStep: 'Generation cancelled',
		});
	}

	async getRecentGenerations(userId: string, limit = 10): Promise<ASMRGenerationResponse[]> {
		const generations = await this.asmrGenerationRepository.find({
			user: userId,
		}, {
			orderBy: {createdAt: 'DESC'},
			limit,
		});

		return generations.map(gen => ({
			generationId: gen.id,
			status: gen.status,
			estimatedDuration: gen.estimatedDuration,
			cost: {
				totalCost: gen.cost,
				voiceCost: gen.cost * 0.7, // Approximate breakdown
				soundscapeCost: gen.cost * 0.2,
				processingCost: gen.cost * 0.1,
				characterCount: gen.content.length,
				estimatedDuration: gen.estimatedDuration,
				breakdown: [],
			},
			downloadUrl: `/asmr/${gen.id}/download`,
			progressUrl: `/asmr/${gen.id}/progress`,
		}));
	}

	private updateProgress(generationId: string, update: Partial<ASMRProgress>): void {
		const stream = this.progressStreams.get(generationId);
		if (stream) {
			const currentProgress = stream.value;
			stream.next({
				...currentProgress,
				...update,
				generationId,
				timestamp: new Date(),
			});
		}
	}

	private async updateGenerationStatus(generationId: string, status: GenerationStatus): Promise<void> {
		const generation = await this.asmrGenerationRepository.findOne(generationId);
		if (generation) {
			generation.status = status;
			await this.asmrGenerationRepository.getEntityManager().persistAndFlush(generation);
		}
	}

	private async saveGenerationResult(generationId: string, result: any): Promise<void> {
		this.generationResults.set(generationId, result);

		const generation = await this.asmrGenerationRepository.findOne(generationId);
		if (generation) {
			generation.filePath = result.filePath;
			generation.duration = result.duration;
			generation.fileSize = result.fileSize;
			await this.asmrGenerationRepository.getEntityManager().persistAndFlush(generation);
		}
	}
}
