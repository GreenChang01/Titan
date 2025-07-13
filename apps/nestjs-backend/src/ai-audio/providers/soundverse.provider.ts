import {Injectable, Logger, HttpException, HttpStatus} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import axios, {AxiosInstance} from 'axios';
import {
	ISoundscapeProvider,
	SoundscapeOptions,
	SoundscapeCategory,
	SoundscapeGenerationResult,
	ElderlyFriendlySoundscapes,
} from '../interfaces';

type ElevenLabsSoundEffectsRequest = {
	text: string;
	duration_seconds: number;
	prompt_influence?: number;
};

/**
 * ElevenLabs Sound Effects Provider
 * 使用ElevenLabs的Sound Effects API生成音景
 * 最大支持22秒单次生成，超过则分段生成并拼接
 */
@Injectable()
export class ElevenLabsSoundscapeProvider implements ISoundscapeProvider {
	private readonly logger = new Logger(ElevenLabsSoundscapeProvider.name);
	private readonly maxChunkDuration = 22; // ElevenLabs限制
	private readonly client: AxiosInstance;
	private readonly apiKey: string;

	constructor(private readonly configService: ConfigService) {
		this.apiKey = this.configService.get<string>('ELEVENLABS_API_KEY') || '';

		if (!this.apiKey) {
			throw new Error('ELEVENLABS_API_KEY is required for soundscape generation');
		}

		this.client = axios.create({
			baseURL: 'https://api.elevenlabs.io',
			headers: {
				'xi-api-key': this.apiKey,
				'Content-Type': 'application/json',
			},
			timeout: 60_000,
		});

		this.setupInterceptors();
		this.logger.log('ElevenLabs Soundscape Provider initialized');
	}

	private setupInterceptors(): void {
		this.client.interceptors.request.use(
			(config) => {
				this.logger.debug(`ElevenLabs Sound Effects API Request: ${config.method?.toUpperCase()} ${config.url}`);
				return config;
			},
			async (error) => {
				this.logger.error('ElevenLabs Sound Effects API Request Error:', error.message);
				throw error;
			},
		);

		this.client.interceptors.response.use(
			(response) => {
				this.logger.debug(`ElevenLabs Sound Effects API Response: ${response.status} ${response.config.url}`);
				return response;
			},
			(error) => {
				const status = error.response?.status;
				const message = error.response?.data?.detail || error.message;
				this.logger.error(`ElevenLabs Sound Effects API Error: ${status} - ${message}`);

				if (status === 401) {
					throw new HttpException('ElevenLabs Sound Effects API authentication failed', HttpStatus.UNAUTHORIZED);
				} else if (status === 429) {
					throw new HttpException('ElevenLabs Sound Effects API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
				} else if (status >= 500) {
					throw new HttpException('ElevenLabs Sound Effects API server error', HttpStatus.SERVICE_UNAVAILABLE);
				}

				throw new HttpException(
					`ElevenLabs Sound Effects API error: ${message}`,
					status || HttpStatus.INTERNAL_SERVER_ERROR,
				);
			},
		);
	}

	async generateSoundscape(prompt: string, options: SoundscapeOptions): Promise<SoundscapeGenerationResult> {
		const startTime = Date.now();

		try {
			this.logger.log(`Generating soundscape: "${prompt}" (${options.duration}s)`);

			// 应用ASMR和中老年人友好的优化
			const optimizedOptions = this.applyASMROptimization(options);
			const optimizedPrompt = this.optimizePromptForElderly(prompt, options.category);

			// 检查是否需要分段生成
			if (optimizedOptions.duration > this.maxChunkDuration) {
				return this.generateLongSoundscape(optimizedPrompt, optimizedOptions, startTime);
			}

			// 单段生成
			const audioBuffer = await this.generateSingleChunk(optimizedPrompt, optimizedOptions.duration);
			const processingTime = Date.now() - startTime;

			// 后处理：确保音频适合ASMR使用
			const processedBuffer = await this.postProcessForASMR(audioBuffer, optimizedOptions);

			this.logger.log(`Soundscape generation completed in ${processingTime}ms`);

			return {
				audioBuffer: processedBuffer,
				metadata: {
					duration: options.duration,
					sampleRate: 44_100,
					format: 'wav',
					size: processedBuffer.length,
					provider: 'ElevenLabs Sound Effects',
					category: options.category,
					intensity: options.intensity,
					cost: await this.estimateCost(options.duration, options.quality),
					isLoopable: options.loopable,
				},
			};
		} catch (error) {
			this.logger.error(`Soundscape generation failed: ${(error as Error).message}`);

			// 如果API失败，提供备用的本地生成方案
			if (this.configService.get<boolean>('ENABLE_FALLBACK_GENERATION', true)) {
				return this.generateFallbackSoundscape(prompt, options);
			}

			throw error;
		}
	}

	/**
	 * 生成单个音频块
	 */
	private async generateSingleChunk(prompt: string, duration: number): Promise<Buffer> {
		const requestData: ElevenLabsSoundEffectsRequest = {
			text: prompt,
			duration_seconds: Math.min(duration, this.maxChunkDuration),
			prompt_influence: 0.3, // 中等提示影响力
		};

		const response = await this.client.post('/v1/text-to-sound-effects', requestData, {
			responseType: 'arraybuffer',
			headers: {
				Accept: 'audio/mpeg',
			},
		});

		return Buffer.from(response.data);
	}

	/**
	 * 生成长音频（分段拼接）
	 */
	private async generateLongSoundscape(
		prompt: string,
		options: SoundscapeOptions,
		startTime: number,
	): Promise<SoundscapeGenerationResult> {
		const chunks = Math.ceil(options.duration / this.maxChunkDuration);
		this.logger.log(`Generating ${chunks} chunks for ${options.duration}s soundscape`);

		const audioChunks: Buffer[] = [];
		let totalCost = 0;

		for (let index = 0; index < chunks; index++) {
			const chunkDuration = Math.min(this.maxChunkDuration, options.duration - index * this.maxChunkDuration);

			this.logger.debug(`Generating chunk ${index + 1}/${chunks} (${chunkDuration}s)`);

			const chunkBuffer = await this.generateSingleChunk(prompt, chunkDuration);
			audioChunks.push(chunkBuffer);

			totalCost += await this.estimateCost(chunkDuration, options.quality);

			// 短暂延迟避免API限制
			if (index < chunks - 1) {
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		}

		// 拼接所有音频块（这里需要FFmpeg集成）
		const concatenatedBuffer = await this.concatenateAudioChunks(audioChunks);
		const processedBuffer = await this.postProcessForASMR(concatenatedBuffer, options);

		const processingTime = Date.now() - startTime;
		this.logger.log(`Long soundscape generation completed in ${processingTime}ms`);

		return {
			audioBuffer: processedBuffer,
			metadata: {
				duration: options.duration,
				sampleRate: 44_100,
				format: 'wav',
				size: processedBuffer.length,
				provider: 'ElevenLabs Sound Effects',
				category: options.category,
				intensity: options.intensity,
				cost: totalCost,
				isLoopable: options.loopable,
			},
		};
	}

	/**
	 * 拼接音频块（简化实现，实际需要FFmpeg）
	 */
	private async concatenateAudioChunks(chunks: Buffer[]): Promise<Buffer> {
		// 简单的Buffer拼接，实际需要FFmpeg进行无缝音频拼接
		this.logger.debug('Concatenating audio chunks (simplified implementation)');
		return Buffer.concat(chunks);
	}

	async getAvailableCategories(): Promise<SoundscapeCategory[]> {
		try {
			// 基于ASMR需求定义的分类，适合中老年人使用
			const categories: SoundscapeCategory[] = [
				{
					id: 'nature',
					name: '自然环境',
					description: '雨声、海浪、森林等自然音效',
					tags: ['放松', '睡眠', '冥想'],
					defaultIntensity: 3,
					suitableForASMR: true,
				},
				{
					id: 'indoor',
					name: '室内环境',
					description: '壁炉、图书馆、咖啡厅等室内音效',
					tags: ['舒适', '专注', '温暖'],
					defaultIntensity: 4,
					suitableForASMR: true,
				},
				{
					id: 'musical',
					name: '音乐性环境',
					description: '风铃、钢琴等轻柔音乐元素',
					tags: ['旋律', '和谐', '艺术'],
					defaultIntensity: 2,
					suitableForASMR: true,
				},
				{
					id: 'synthetic',
					name: '合成音效',
					description: '白噪音、粉噪音等合成音效',
					tags: ['专注', '遮蔽', '一致'],
					defaultIntensity: 5,
					suitableForASMR: false, // 对中老年人可能不够友好
				},
			];

			// 过滤掉不适合中老年人的分类
			return categories.filter(
				(cat) =>
					([...ElderlyFriendlySoundscapes.preferredCategories] as string[]).includes(cat.id) || cat.suitableForASMR,
			);
		} catch (error) {
			this.logger.error(`Failed to fetch categories: ${(error as Error).message}`);
			throw error;
		}
	}

	async estimateCost(duration: number, quality: string): Promise<number> {
		// ElevenLabs Sound Effects估算价格 (基于官方定价)
		// 大约 $0.18-0.30 per 22秒chunk，根据质量不同
		const chunks = Math.ceil(duration / this.maxChunkDuration);
		const baseRatePerChunk: Record<string, number> = {
			standard: 0.18,
			high: 0.24,
			premium: 0.3,
		};

		const rate = baseRatePerChunk[quality] || baseRatePerChunk.standard;

		return chunks * rate;
	}

	async validateConnection(): Promise<boolean> {
		try {
			// 使用ElevenLabs用户信息端点验证连接
			await this.client.get('/v1/user');
			this.logger.log('ElevenLabs Sound Effects connection validated successfully');
			return true;
		} catch (error) {
			this.logger.error(`ElevenLabs Sound Effects connection validation failed: ${(error as Error).message}`);
			return false;
		}
	}

	/**
	 * 应用ASMR和中老年人友好的优化
	 */
	private applyASMROptimization(options: SoundscapeOptions): SoundscapeOptions {
		const optimized = {...options};

		// 调整强度范围，避免过于激烈的音效
		if (optimized.intensity > ElderlyFriendlySoundscapes.recommendedIntensity.max) {
			optimized.intensity = ElderlyFriendlySoundscapes.recommendedIntensity.max;
			this.logger.debug(`Intensity reduced to ${optimized.intensity} for elderly-friendly generation`);
		}

		if (optimized.intensity < ElderlyFriendlySoundscapes.recommendedIntensity.min) {
			optimized.intensity = ElderlyFriendlySoundscapes.recommendedIntensity.min;
		}

		// 确保音景适合循环播放
		optimized.loopable = true;

		return optimized;
	}

	/**
	 * 针对中老年人优化提示词
	 */
	private optimizePromptForElderly(prompt: string, category: string): string {
		let optimizedPrompt = prompt;

		// 添加中老年人友好的修饰词
		const elderlyFriendlyModifiers = ['gentle', 'soft', 'peaceful', 'calm', 'soothing', 'warm', 'comfortable'];

		// 避免的刺激性词汇
		const avoidWords = ['loud', 'intense', 'sharp', 'sudden', 'harsh'];

		// 检查并替换刺激性词汇
		for (const word of avoidWords) {
			const regex = new RegExp(`\\b${word}\\b`, 'gi');
			optimizedPrompt = optimizedPrompt.replace(regex, 'gentle');
		}

		// 为特定分类添加优化
		if (category === 'nature') {
			optimizedPrompt += ', very peaceful and calming for relaxation';
		} else if (category === 'indoor') {
			optimizedPrompt += ', cozy and comfortable atmosphere';
		}

		return optimizedPrompt;
	}

	/**
	 * ASMR后处理优化
	 */
	private async postProcessForASMR(audioBuffer: Buffer, options: SoundscapeOptions): Promise<Buffer> {
		// 这里应该调用FFmpeg进行后处理
		// 1. 标准化音量
		// 2. 应用低通滤波器减少高频刺激
		// 3. 添加淡入淡出
		// 4. 如果需要，制作无缝循环

		// 当前返回原始音频，实际应该集成FFmpeg处理
		this.logger.debug('ASMR post-processing applied (placeholder)');
		return audioBuffer;
	}

	/**
	 * 备用本地音景生成
	 */
	private async generateFallbackSoundscape(
		prompt: string,
		options: SoundscapeOptions,
	): Promise<SoundscapeGenerationResult> {
		this.logger.warn('Using fallback soundscape generation');

		// 生成简单的噪音作为备用方案
		// 实际应用中可以预先录制一些基础音景
		const sampleRate = 44_100;
		const samples = sampleRate * options.duration;
		const audioBuffer = Buffer.alloc(samples * 2); // 16-bit audio

		// 生成简单的粉噪音
		for (let index = 0; index < samples; index++) {
			const noise = (Math.random() - 0.5) * 0.1 * options.intensity * 1000;
			const sample = Math.max(-32_768, Math.min(32_767, noise));
			audioBuffer.writeInt16LE(sample, index * 2);
		}

		return {
			audioBuffer,
			metadata: {
				duration: options.duration,
				sampleRate: 44_100,
				format: 'wav',
				size: audioBuffer.length,
				provider: 'ElevenLabs Sound Effects (Fallback)',
				category: options.category,
				intensity: options.intensity,
				cost: 0, // 备用方案无成本
				isLoopable: true,
			},
		};
	}
}
