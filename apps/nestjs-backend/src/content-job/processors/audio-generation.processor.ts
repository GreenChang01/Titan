import {promises as fs} from 'node:fs';
import * as path from 'node:path';
import {Processor, Process} from '@nestjs/bull';
import {Logger} from '@nestjs/common';
import {Job} from 'bull';
import {ASMRContentService} from '../../ai-audio/services/asmr-content.service';

type AudioGenerationJobData = {
	jobId: string;
	text: string;
	duration?: number;
	voicePreset?: string;
	soundscapeType?: string;
	outputPath: string;
};

type AudioGenerationResult = {
	success: boolean;
	audioPath?: string;
	metadata?: any;
	error?: string;
	processingTime: number;
};

@Processor('audio-generation')
export class AudioGenerationConsumer {
	private readonly logger = new Logger(AudioGenerationConsumer.name);

	constructor(private readonly asmrContentService: ASMRContentService) {}

	@Process('generate-asmr')
	async handleASMRGeneration(job: Job<AudioGenerationJobData>): Promise<AudioGenerationResult> {
		const startTime = Date.now();
		const {
			jobId,
			text,
			duration = 30,
			voicePreset = 'ELDERLY_FRIENDLY',
			soundscapeType = 'RAIN_FOREST',
			outputPath,
		} = job.data;

		try {
			this.logger.log(`Starting ASMR generation for job ${jobId}: "${text}" (${duration}s)`);

			// 更新任务进度
			await job.progress(10);

			// 创建ASMR生成请求
			const asmrRequest = this.asmrContentService.createElderlyFriendlyTemplate(
				text,
				voicePreset as any,
				soundscapeType as any,
			);

			// 设置持续时间
			asmrRequest.soundscapeConfig.duration = duration;

			await job.progress(20);

			// 生成ASMR内容
			this.logger.log(`Generating ASMR content for job ${jobId}`);
			const result = await this.asmrContentService.generateASMRContent(asmrRequest);

			await job.progress(80);

			// 确保输出目录存在
			const outputDir = path.dirname(outputPath);
			await fs.mkdir(outputDir, {recursive: true});

			// 保存音频文件
			await fs.writeFile(outputPath, result.audioBuffer);

			await job.progress(100);

			const processingTime = Date.now() - startTime;
			this.logger.log(`ASMR generation completed for job ${jobId} in ${processingTime}ms`);

			return {
				success: true,
				audioPath: outputPath,
				metadata: {
					...result.metadata,
					processingTime,
					qualityScore: result.qualityReport?.overallScore,
					components: result.components,
				},
				processingTime,
			};
		} catch (error) {
			const processingTime = Date.now() - startTime;
			const errorMessage = error instanceof Error ? error.message : String(error);
			const errorStack = error instanceof Error ? error.stack : undefined;
			this.logger.error(`ASMR generation failed for job ${jobId}: ${errorMessage}`, errorStack);

			return {
				success: false,
				error: errorMessage,
				processingTime,
			};
		}
	}

	@Process('generate-voice')
	async handleVoiceGeneration(job: Job<AudioGenerationJobData>): Promise<AudioGenerationResult> {
		const startTime = Date.now();
		const {jobId, text, voicePreset = 'ELDERLY_FRIENDLY', outputPath} = job.data;

		try {
			this.logger.log(`Starting voice generation for job ${jobId}: "${text}"`);

			await job.progress(10);

			// 获取ElevenLabs提供者
			const {elevenLabsProvider} = this.asmrContentService as any;

			// 创建语音选项
			const voiceOptions = {
				voiceId: '21m00Tcm4TlvDq8ikWAM', // 默认语音ID
				stability: 0.8,
				similarityBoost: 0.9,
				style: 0.2,
				speakerBoost: true,
			};

			await job.progress(30);

			// 生成语音
			const result = await elevenLabsProvider.generateVoice(text, voiceOptions);

			await job.progress(80);

			// 确保输出目录存在
			const outputDir = path.dirname(outputPath);
			await fs.mkdir(outputDir, {recursive: true});

			// 保存音频文件
			await fs.writeFile(outputPath, result.audioBuffer);

			await job.progress(100);

			const processingTime = Date.now() - startTime;
			this.logger.log(`Voice generation completed for job ${jobId} in ${processingTime}ms`);

			return {
				success: true,
				audioPath: outputPath,
				metadata: result.metadata,
				processingTime,
			};
		} catch (error) {
			const processingTime = Date.now() - startTime;
			const errorMessage = error instanceof Error ? error.message : String(error);
			const errorStack = error instanceof Error ? error.stack : undefined;
			this.logger.error(`Voice generation failed for job ${jobId}: ${errorMessage}`, errorStack);

			return {
				success: false,
				error: errorMessage,
				processingTime,
			};
		}
	}

	@Process('generate-soundscape')
	async handleSoundscapeGeneration(job: Job<AudioGenerationJobData>): Promise<AudioGenerationResult> {
		const startTime = Date.now();
		const {jobId, text, duration = 30, soundscapeType = 'RAIN_FOREST', outputPath} = job.data;

		try {
			this.logger.log(`Starting soundscape generation for job ${jobId}: "${text}" (${duration}s)`);

			await job.progress(10);

			// 获取ElevenLabs音景提供者
			const soundscapeProvider = (this.asmrContentService as any).elevenLabsSoundscapeProvider;

			// 创建音景选项
			const soundscapeOptions = {
				duration,
				category: soundscapeType,
				intensity: 3,
				quality: 'high' as const,
				loopable: true,
				binauralEnabled: true,
				spatialWidth: 1.1,
			};

			await job.progress(30);

			// 生成音景
			const result = await soundscapeProvider.generateSoundscape(text, soundscapeOptions);

			await job.progress(80);

			// 确保输出目录存在
			const outputDir = path.dirname(outputPath);
			await fs.mkdir(outputDir, {recursive: true});

			// 保存音频文件
			await fs.writeFile(outputPath, result.audioBuffer);

			await job.progress(100);

			const processingTime = Date.now() - startTime;
			this.logger.log(`Soundscape generation completed for job ${jobId} in ${processingTime}ms`);

			return {
				success: true,
				audioPath: outputPath,
				metadata: result.metadata,
				processingTime,
			};
		} catch (error) {
			const processingTime = Date.now() - startTime;
			const errorMessage = error instanceof Error ? error.message : String(error);
			const errorStack = error instanceof Error ? error.stack : undefined;
			this.logger.error(`Soundscape generation failed for job ${jobId}: ${errorMessage}`, errorStack);

			return {
				success: false,
				error: errorMessage,
				processingTime,
			};
		}
	}
}
