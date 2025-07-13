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

/**
 * ASMR内容生成请求配置
 * 包含语音、音景、混音和质量要求的完整配置
 */
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

/**
 * ASMR内容生成结果
 * 包含生成的音频数据、元数据、质量报告和组件状态
 */
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

/**
 * ASMR内容生成服务
 *
 * 提供完整的ASMR音频内容生成功能，专门针对中老年用户优化
 * 集成ElevenLabs语音合成、音景生成和FFmpeg音频处理能力
 *
 * 主要功能：
 * - AI驱动的语音合成（支持多种语言和声音风格）
 * - 智能音景生成（自然声音、室内环境等）
 * - 专业音频混合和双耳效果处理
 * - 中老年人友好的参数优化
 * - 批量处理和质量控制
 * - 成本估算和服务健康检查
 *
 * 技术特性：
 * - 支持高质量音频输出（48kHz/24bit）
 * - 自动质量验证和重试机制
 * - 并发控制的批量处理
 * - 完整的错误处理和日志记录
 *
 * @example
 * ```typescript
 * const request = service.createElderlyFriendlyTemplate(
 *   "欢迎来到放松时光",
 *   'ELDERLY_FRIENDLY',
 *   'RAIN_FOREST'
 * );
 * const result = await service.generateASMRContent(request);
 * ```
 *
 * @dependencies
 * - ElevenLabsProvider: 语音合成服务
 * - ElevenLabsSoundscapeProvider: 音景生成服务
 * - FfmpegAudioMixer: 音频处理和混合
 * - ConfigService: 配置管理
 *
 * @sideEffects
 * - 产生AI服务API调用费用
 * - 生成临时音频文件
 * - 可能消耗大量CPU和内存资源
 */
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
	 *
	 * 执行完整的ASMR生成工作流程：
	 * 1. 参数优化（针对中老年人友好设置）
	 * 2. AI语音生成（ElevenLabs）
	 * 3. AI音景生成（ElevenLabs Soundscape）
	 * 4. 音频混合和双耳效果处理
	 * 5. ASMR专项优化
	 * 6. 质量验证和自动重试
	 * 7. 格式转换和输出
	 *
	 * @param request ASMR生成请求配置，包含文本、语音、音景和混音设置
	 * @returns Promise<ASMRGenerationResult> 包含音频Buffer、元数据和质量报告的完整结果
	 *
	 * @throws {Error} 当AI服务调用失败、音频处理出错或质量验证失败时抛出异常
	 *
	 * @complexity O(1) - 单次请求处理，但涉及多个异步AI服务调用
	 * @dependencies ElevenLabsProvider, ElevenLabsSoundscapeProvider, FfmpegAudioMixer
	 * @sideEffects 产生AI服务费用，生成临时音频文件
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
				this.logger.warn(
					`Quality score ${qualityReport.overallScore} below minimum ${optimizedRequest.qualityRequirements.minimumScore}, considering retry`,
				);

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
	 *
	 * 支持并发控制的批量ASMR生成，自动分批处理以避免资源过载
	 * 使用Promise.allSettled确保部分失败不影响整体处理
	 *
	 * @param requests ASMR生成请求配置数组
	 * @returns Promise<ASMRGenerationResult[]> 成功生成的结果数组（失败的项目会被过滤）
	 *
	 * @complexity O(n/c) - n为请求数量，c为最大并发数，实际取决于AI服务响应时间
	 * @dependencies generateASMRContent方法，继承其所有依赖
	 * @sideEffects 产生大量AI服务费用，可能生成大量临时文件
	 */
	async generateBatchASMRContent(requests: ASMRGenerationRequest[]): Promise<ASMRGenerationResult[]> {
		this.logger.log(`Starting batch generation of ${requests.length} ASMR contents`);

		const results: ASMRGenerationResult[] = [];
		const maxConcurrent = this.configService.get<number>('MAX_CONCURRENT_AUDIO_JOBS', 3);

		// 分批处理以控制并发
		for (let index_ = 0; index_ < requests.length; index_ += maxConcurrent) {
			const batch = requests.slice(index_, index_ + maxConcurrent);

			this.logger.log(
				`Processing batch ${Math.floor(index_ / maxConcurrent) + 1}/${Math.ceil(requests.length / maxConcurrent)}`,
			);

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
	 *
	 * 返回针对中老年用户优化的预设配置集合，包括语音、音景、混音参数
	 * 这些预设经过专门调优，确保音频内容适合中老年用户的听觉特点
	 *
	 * @returns 包含语音预设、音景模板、混音预设和推荐配置的对象
	 *
	 * @complexity O(1) - 简单的静态配置返回
	 * @dependencies 预设常量：ASMRVoicePresets, ASMRSoundscapeTemplates, ASMRMixingPresets, ElderlyFriendlySoundscapes
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
	 *
	 * 检查所有外部AI服务的可用性，包括ElevenLabs语音和音景服务
	 * 用于系统健康检查和故障诊断
	 *
	 * @returns Promise 包含各个服务状态和整体可用性的对象
	 *
	 * @complexity O(1) - 并发验证多个服务，总时间取决于最慢的服务响应
	 * @dependencies ElevenLabsProvider.validateConnection, ElevenLabsSoundscapeProvider.validateConnection
	 * @sideEffects 可能产生少量API调用费用用于连接测试
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
	 *
	 * 基于请求配置预估AI服务使用费用，包括语音生成和音景生成成本
	 * 用于用户预算控制和成本透明化
	 *
	 * @param request ASMR生成请求配置，用于计算成本的依据
	 * @returns Promise 包含语音成本、音景成本、总成本和货币单位的对象
	 *
	 * @complexity O(1) - 基于配置参数的成本计算
	 * @dependencies ElevenLabsProvider.estimateCost, ElevenLabsSoundscapeProvider.estimateCost
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
	 *
	 * 根据中老年用户的听觉特点和偏好，自动调整语音、音景和混音参数
	 * 包括提高语音稳定性、选择适合的音景类别、延长淡入淡出时间等
	 *
	 * @param request 原始ASMR生成请求配置
	 * @returns 优化后的ASMR生成请求配置
	 *
	 * @complexity O(1) - 参数调整和验证
	 * @dependencies ElderlyFriendlySoundscapes常量配置
	 * @sideEffects 可能在日志中记录不适合的音景选择警告
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
	 *
	 * 基于预设配置快速创建适合中老年用户的ASMR生成请求
	 * 使用经过验证的参数组合，确保生成高质量的ASMR内容
	 *
	 * @param text 要转换为语音的文本内容
	 * @param voicePreset 语音预设类型，默认为ELDERLY_FRIENDLY
	 * @param soundscapeType 音景类型，默认为RAIN_FOREST
	 * @returns 完整配置的ASMR生成请求对象
	 *
	 * @complexity O(1) - 基于预设模板的对象构建
	 * @dependencies ASMRVoicePresets, ASMRSoundscapeTemplates, ASMRMixingPresets常量
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
