import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
	VoiceOptions,
	SoundscapeOptions,
	MixingOptions,
	BinauralSettings,
	ElderlyFriendlySoundscapes,
	ASMRVoicePresets,
	ASMRSoundscapeTemplates,
	ASMRMixingPresets,
} from '../interfaces';
import {ElevenLabsProvider} from '../providers/elevenlabs.provider';
import {ElevenLabsSoundscapeProvider} from '../providers/soundverse.provider';
import {FfmpegAudioMixer} from './ffmpeg-audio-mixer.service';

export type ASMRGenerationRequest = {
	text: string;
	voiceSettings: VoiceOptions;
	soundscapeConfig: SoundscapeOptions & {
		prompt: string;
	};
	mixingSettings: MixingOptions;
	binauralSettings?: BinauralSettings;
	qualityRequirements?: {
		minimumScore: number;
		enableAutoRetry: boolean;
		maxRetryAttempts: number;
	};
};

export type ASMRGenerationResult = {
	audioBuffer: Buffer;
	metadata: {
		totalDuration: number;
		fileSize: number;
		format: string;
		sampleRate: number;
		provider: string;
		processingTime: number;
		aiCost: number;
		qualityScore: number;
	};
	qualityReport: any;
	components: {
		voiceGenerated: boolean;
		soundscapeGenerated: boolean;
		mixingApplied: boolean;
		asmrOptimized: boolean;
	};
};

@Injectable()
export class ASMRContentService {
	private readonly logger = new Logger(ASMRContentService.name);

	constructor(
		private readonly configService: ConfigService,
		private readonly elevenLabsProvider: ElevenLabsProvider,
		private readonly elevenLabsSoundscapeProvider: ElevenLabsSoundscapeProvider,
		private readonly audioMixer: FfmpegAudioMixer,
	) {
		this.logger.log('ASMR Content Service initialized');
	}

	/**
   * 生成完整的ASMR音频内容
   */
	async generateASMRContent(request: ASMRGenerationRequest): Promise<ASMRGenerationResult> {
		const startTime = Date.now();
		let totalCost = 0;
		const components = {
			voiceGenerated: false,
			soundscapeGenerated: false,
			mixingApplied: false,
			asmrOptimized: false,
		};

		try {
			this.logger.log('Starting ASMR content generation');

			// 验证和优化请求参数
			const optimizedRequest = this.optimizeRequestForElderly(request);

			// 1. 生成AI语音
			this.logger.log('Generating AI voice...');
			const voiceResult = await this.elevenLabsProvider.generateVoice(
				optimizedRequest.text,
				optimizedRequest.voiceSettings,
			);
			components.voiceGenerated = true;
			totalCost += voiceResult.metadata.cost || 0;

			// 2. 生成AI音景
			this.logger.log('Generating AI soundscape...');
			const soundscapeResult = await this.elevenLabsSoundscapeProvider.generateSoundscape(
				optimizedRequest.soundscapeConfig.prompt,
				optimizedRequest.soundscapeConfig,
			);
			components.soundscapeGenerated = true;
			totalCost += soundscapeResult.metadata.cost || 0;

			// 3. 混合音频
			this.logger.log('Mixing voice and soundscape...');
			const mixedResult = await this.audioMixer.mixVoiceAndSoundscape(
				voiceResult.audioBuffer,
				soundscapeResult.audioBuffer,
				optimizedRequest.mixingSettings,
			);
			components.mixingApplied = true;

			// 4. 应用双耳效果（如果启用）
			let finalAudio = mixedResult.outputBuffer;
			if (optimizedRequest.binauralSettings?.enabled) {
				this.logger.log('Applying binaural effects...');
				finalAudio = await this.audioMixer.applyBinauralEffects(finalAudio, optimizedRequest.binauralSettings);
			}

			// 5. ASMR优化
			this.logger.log('Applying ASMR optimization...');
			finalAudio = await this.audioMixer.optimizeForAsmr(finalAudio);
			components.asmrOptimized = true;

			// 6. 质量验证
			const qualityReport = await this.audioMixer.analyzeAudioQuality(finalAudio);

			// 7. 质量检查和重试逻辑
			if (
				optimizedRequest.qualityRequirements?.enableAutoRetry
				&& qualityReport.overallScore < optimizedRequest.qualityRequirements.minimumScore
			) {
				this.logger.warn(`Quality score ${qualityReport.overallScore} below minimum ${optimizedRequest.qualityRequirements.minimumScore}, considering retry`);

				if (qualityReport.needsReprocessing) {
					// 这里可以实现智能重试逻辑
					this.logger.log('Auto-retry would be implemented here');
				}
			}

			// 8. 转换为最终格式
			const outputFormat = this.configService.get<'mp3' | 'wav'>('AUDIO_OUTPUT_FORMAT', 'mp3');
			if (outputFormat !== 'wav') {
				finalAudio = await this.audioMixer.convertFormat(finalAudio, outputFormat, 'high');
			}

			const processingTime = Date.now() - startTime;
			this.logger.log(`ASMR content generation completed in ${processingTime}ms`);

			return {
				audioBuffer: finalAudio,
				metadata: {
					totalDuration: mixedResult.metadata.duration,
					fileSize: finalAudio.length,
					format: outputFormat,
					sampleRate: mixedResult.metadata.sampleRate,
					provider: 'Titan ASMR Engine',
					processingTime,
					aiCost: totalCost,
					qualityScore: qualityReport.overallScore,
				},
				qualityReport,
				components,
			};
		} catch (error) {
			this.logger.error(`ASMR content generation failed: ${(error as Error).message}`);
			throw error;
		}
	}

	/**
   * 批量生成ASMR内容
   */
	async generateBatchASMRContent(requests: ASMRGenerationRequest[]): Promise<ASMRGenerationResult[]> {
		this.logger.log(`Starting batch generation of ${requests.length} ASMR contents`);

		const results: ASMRGenerationResult[] = [];
		const maxConcurrent = this.configService.get<number>('MAX_CONCURRENT_AUDIO_JOBS', 3);

		// 分批处理以控制并发
		for (let index_ = 0; index_ < requests.length; index_ += maxConcurrent) {
			const batch = requests.slice(index_, index_ + maxConcurrent);

			this.logger.log(`Processing batch ${Math.floor(index_ / maxConcurrent) + 1}/${Math.ceil(requests.length / maxConcurrent)}`);

			const batchPromises = batch.map(async (request, index) => {
				try {
					return await this.generateASMRContent(request);
				} catch (error) {
					this.logger.error(`Batch item ${index_ + index + 1} failed: ${(error as Error).message}`);
					throw error;
				}
			});

			const batchResults = await Promise.allSettled(batchPromises);

			for (const [index, result] of batchResults.entries()) {
				if (result.status === 'fulfilled') {
					results.push(result.value);
				} else {
					this.logger.error(`Batch item ${index_ + index + 1} failed:`, result.reason);
					// 可以选择继续处理其他项目或抛出错误
				}
			}
		}

		this.logger.log(`Batch generation completed: ${results.length}/${requests.length} successful`);
		return results;
	}

	/**
   * 获取适合中老年人的ASMR预设配置
   */
	getElderlyFriendlyPresets(): {
		voicePresets: typeof ASMRVoicePresets;
		soundscapeTemplates: typeof ASMRSoundscapeTemplates;
		mixingPresets: typeof ASMRMixingPresets;
		recommendations: typeof ElderlyFriendlySoundscapes;
	} {
		return {
			voicePresets: ASMRVoicePresets,
			soundscapeTemplates: ASMRSoundscapeTemplates,
			mixingPresets: ASMRMixingPresets,
			recommendations: ElderlyFriendlySoundscapes,
		};
	}

	/**
   * 验证AI服务连接状态
   */
	async validateAIServices(): Promise<{
		elevenlabs: boolean;
		elevenLabsSoundscape: boolean;
		ffmpeg: boolean;
		overall: boolean;
	}> {
		const results = {
			elevenlabs: false,
			elevenLabsSoundscape: false,
			ffmpeg: true, // FFmpeg是本地服务
			overall: false,
		};

		try {
			results.elevenlabs = await this.elevenLabsProvider.validateConnection();
		} catch (error) {
			this.logger.warn(`ElevenLabs validation failed: ${(error as Error).message}`);
		}

		try {
			results.elevenLabsSoundscape = await this.elevenLabsSoundscapeProvider.validateConnection();
		} catch (error) {
			this.logger.warn(`ElevenLabs Soundscape validation failed: ${(error as Error).message}`);
		}

		results.overall = results.elevenlabs && results.elevenLabsSoundscape && results.ffmpeg;

		this.logger.log(`AI Services validation: ${JSON.stringify(results)}`);
		return results;
	}

	/**
   * 估算生成成本
   */
	async estimateGenerationCost(request: ASMRGenerationRequest): Promise<{
		voiceCost: number;
		soundscapeCost: number;
		totalCost: number;
		currency: string;
	}> {
		const voiceCost = await this.elevenLabsProvider.estimateCost(request.text, request.voiceSettings);

		const soundscapeCost = await this.elevenLabsSoundscapeProvider.estimateCost(
			request.soundscapeConfig.duration,
			request.soundscapeConfig.quality,
		);

		return {
			voiceCost,
			soundscapeCost,
			totalCost: voiceCost + soundscapeCost,
			currency: 'USD',
		};
	}

	/**
   * 针对中老年人优化请求参数
   */
	private optimizeRequestForElderly(request: ASMRGenerationRequest): ASMRGenerationRequest {
		const optimized = {...request};

		// 应用中老年人友好的语音设置
		if (!optimized.voiceSettings.stability) {
			optimized.voiceSettings.stability = 0.85; // 更高的稳定性
		}

		if (!optimized.voiceSettings.style) {
			optimized.voiceSettings.style = 0.1; // 更自然的风格
		}

		// 检查音景是否适合中老年人
		const soundscapeCategory = optimized.soundscapeConfig.category;
		if (!ElderlyFriendlySoundscapes.preferredCategories.includes(soundscapeCategory as 'nature' | 'indoor')) {
			this.logger.warn(`Soundscape category '${soundscapeCategory}' may not be optimal for elderly users`);
		}

		// 应用中老年人友好的混音设置
		if (!optimized.mixingSettings.eqSettings) {
			optimized.mixingSettings = {
				...optimized.mixingSettings,
				...ASMRMixingPresets.ELDERLY_FRIENDLY,
			};
		}

		// 确保淡入淡出时间足够长，避免突然的声音变化
		if (optimized.mixingSettings.fadeInDuration < 3) {
			optimized.mixingSettings.fadeInDuration = 3;
		}

		if (optimized.mixingSettings.fadeOutDuration < 5) {
			optimized.mixingSettings.fadeOutDuration = 5;
		}

		return optimized;
	}

	/**
   * 创建推荐的ASMR生成请求模板
   */
	createElderlyFriendlyTemplate(
		text: string,
		voicePreset: keyof typeof ASMRVoicePresets = 'ELDERLY_FRIENDLY',
		soundscapeType: keyof typeof ASMRSoundscapeTemplates = 'RAIN_FOREST',
	): ASMRGenerationRequest {
		const voiceSettings = {
			voiceId: this.configService.get<string>('DEFAULT_ASMR_VOICE_ID', '21m00Tcm4TlvDq8ikWAM'),
			...ASMRVoicePresets[voicePreset],
		};

		const soundscapeTemplate = ASMRSoundscapeTemplates[soundscapeType];
		const soundscapeConfig = {
			...soundscapeTemplate,
			quality: 'high' as const,
			loopable: true,
			binauralEnabled: true,
			spatialWidth: 1.1,
		};

		const mixingSettings = {
			...ASMRMixingPresets.ELDERLY_FRIENDLY,
		};

		const binauralSettings = {
			enabled: true,
			spatialWidth: 1.1,
			leftDelay: 5,
			rightDelay: 10,
			reverbAmount: 0.1,
		};

		return {
			text,
			voiceSettings,
			soundscapeConfig,
			mixingSettings,
			binauralSettings,
			qualityRequirements: {
				minimumScore: 6,
				enableAutoRetry: true,
				maxRetryAttempts: 2,
			},
		};
	}
}
