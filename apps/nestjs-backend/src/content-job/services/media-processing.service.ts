import {promises as fs} from 'node:fs';
import * as path from 'node:path';
import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository} from '@mikro-orm/core';
import {ConfigService} from '@nestjs/config';
import * as ffmpeg from 'fluent-ffmpeg';
import {ASMRContentService} from '../../ai-audio/services/asmr-content.service';
import {ContentJob} from '../entities/content-job.entity';
import {Asset} from '../../asset/entities/asset.entity';
import {ContentTemplate} from '../../template/entities/content-template.entity';

export type ProcessingResult = {
	success: boolean;
	outputPath?: string;
	error?: string;
	processingTime: number;
};

@Injectable()
export class MediaProcessingService {
	private readonly logger = new Logger(MediaProcessingService.name);
	private readonly ffmpegPath: string;
	private readonly tempDir: string;

	constructor(
		@InjectRepository(Asset)
		private readonly assetRepository: EntityRepository<Asset>,
		@InjectRepository(ContentTemplate)
		private readonly templateRepository: EntityRepository<ContentTemplate>,
		private readonly configService: ConfigService,
		private readonly asmrContentService: ASMRContentService,
	) {
		this.ffmpegPath = this.configService.get<string>('FFMPEG_PATH', 'ffmpeg');
		this.tempDir = this.configService.get<string>('TEMP_DIR', '/tmp/titan');

		// 设置FFmpeg路径
		ffmpeg.setFfmpegPath(this.ffmpegPath);
	}

	/**
	 * 生成AI ASMR音频内容
	 */
	async generateASMRAudio(
		text: string,
		duration = 30,
		voicePreset = 'ELDERLY_FRIENDLY',
		soundscapeType = 'RAIN_FOREST',
	): Promise<{audioPath: string; metadata: any}> {
		const startTime = Date.now();
		const temporaryDir = path.join(this.tempDir, `asmr_${Date.now()}`);

		try {
			await fs.mkdir(temporaryDir, {recursive: true});

			// 创建ASMR生成请求
			const asmrRequest = this.asmrContentService.createElderlyFriendlyTemplate(
				text,
				voicePreset as any,
				soundscapeType as any,
			);

			// 设置持续时间
			asmrRequest.soundscapeConfig.duration = duration;

			this.logger.log(`Generating ASMR audio: "${text}" (${duration}s)`);

			// 生成ASMR内容
			const result = await this.asmrContentService.generateASMRContent(asmrRequest);

			// 保存音频文件
			const audioFileName = `asmr_${Date.now()}.${result.metadata.format}`;
			const audioPath = path.join(temporaryDir, audioFileName);

			await fs.writeFile(audioPath, result.audioBuffer);

			const processingTime = Date.now() - startTime;
			this.logger.log(`ASMR audio generation completed in ${processingTime}ms`);

			return {
				audioPath,
				metadata: {
					...result.metadata,
					processingTime,
					qualityScore: result.qualityReport?.overallScore,
					components: result.components,
				},
			};
		} catch (error) {
			this.logger.error(`ASMR audio generation failed: ${error instanceof Error ? error.message : String(error)}`);
			throw error;
		}
	}

	/**
	 * 处理内容生产任务
	 */
	async processContentJob(job: ContentJob): Promise<ProcessingResult> {
		const startTime = Date.now();
		const temporaryJobDir = path.join(this.tempDir, job.id);

		try {
			// 创建临时工作目录
			await fs.mkdir(temporaryJobDir, {recursive: true});

			// 获取模板和素材信息
			const template = await this.templateRepository.findOne({id: job.templateId});
			if (!template) {
				throw new Error('Template not found');
			}

			const assets = await this.loadJobAssets(job);

			// 根据模板类型生成视频
			const outputPath = await this.generateVideoFromTemplate(template, assets, job.inputAssets, temporaryJobDir);

			const processingTime = Date.now() - startTime;

			this.logger.log(`Job ${job.id} completed in ${processingTime}ms`);

			return {
				success: true,
				outputPath,
				processingTime,
			};
		} catch (error) {
			const processingTime = Date.now() - startTime;
			const errorMessage = error instanceof Error ? error.message : String(error);
			const errorStack = error instanceof Error ? error.stack : undefined;
			this.logger.error(`Job ${job.id} failed: ${errorMessage}`, errorStack);

			return {
				success: false,
				error: errorMessage,
				processingTime,
			};
		} finally {
			// 清理临时目录
			try {
				await fs.rm(temporaryJobDir, {recursive: true, force: true});
			} catch (cleanupError) {
				this.logger.warn(`Failed to cleanup temp directory: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
			}
		}
	}

	/**
	 * 根据模板生成视频
	 */
	private async generateVideoFromTemplate(
		template: ContentTemplate,
		assets: Map<string, Asset>,
		inputAssets: Array<{assetId: string; slotName: string; parameters?: Record<string, any>}>,
		temporaryDir: string,
	): Promise<string> {
		const templateType = template.templateConfig?.type;
		const outputFileName = `output_${Date.now()}.mp4`;
		const outputPath = path.join(temporaryDir, outputFileName);

		switch (templateType) {
			case 'asmr': {
				return this.generateASMRVideo(template, assets, inputAssets, outputPath);
			}

			case 'dynamic_background': {
				return this.generateDynamicBackgroundVideo(template, assets, inputAssets, outputPath);
			}

			default: {
				return this.generateDefaultVideo(template, assets, inputAssets, outputPath);
			}
		}
	}

	/**
	 * 生成ASMR视频（静态图片 + 背景音乐）
	 */
	private async generateASMRVideo(
		template: ContentTemplate,
		assets: Map<string, Asset>,
		inputAssets: Array<{assetId: string; slotName: string; parameters?: Record<string, any>}>,
		outputPath: string,
	): Promise<string> {
		const backgroundImage = this.getAssetBySlot(assets, inputAssets, 'background_image');
		const bgmAudio = this.getAssetBySlot(assets, inputAssets, 'bgm_audio');

		if (!backgroundImage || !bgmAudio) {
			throw new Error('Missing required assets for ASMR template');
		}

		const config = template.templateConfig;
		const duration = config?.imageDisplayDuration || 30;

		// 预处理文本内容（如果有）
		let textData: string | undefined;
		const textContent = this.getAssetBySlot(assets, inputAssets, 'text_content');
		if (textContent && config?.textStyle) {
			textData = textContent.metadata?.textContent || (await this.readTextFromFile(textContent.filePath));
		}

		return new Promise((resolve, reject) => {
			const command = ffmpeg()
				.input(backgroundImage.filePath)
				.inputOptions(['-loop 1'])
				.input(bgmAudio.filePath)
				.outputOptions(['-c:v libx264', '-t ' + duration, '-pix_fmt yuv420p', '-c:a aac', '-b:a 192k', '-shortest'])
				.size(template.videoSettings?.resolution || '1080x1920')
				.fps(template.videoSettings?.fps || 30);

			// 添加文本覆盖（如果有）
			if (textData && config?.textStyle) {
				const textFilter = this.buildTextFilter(textData, config.textStyle);
				command.videoFilters([textFilter]);
			}

			command
				.output(outputPath)
				.on('start', commandLine => {
					this.logger.log(`FFmpeg command: ${commandLine}`);
				})
				.on('progress', progress => {
					this.logger.log(`Processing: ${progress.percent}% done`);
				})
				.on('end', () => {
					this.logger.log('ASMR video generation completed');
					resolve(outputPath);
				})
				.on('error', error => {
					this.logger.error('ASMR video generation failed:', error.message);
					reject(error);
				})
				.run();
		});
	}

	/**
	 * 生成动态背景视频
	 */
	private async generateDynamicBackgroundVideo(
		template: ContentTemplate,
		assets: Map<string, Asset>,
		inputAssets: Array<{assetId: string; slotName: string; parameters?: Record<string, any>}>,
		outputPath: string,
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const backgroundVideo = this.getAssetBySlot(assets, inputAssets, 'background_video');

			if (!backgroundVideo) {
				reject(new Error('Missing background video for dynamic template'));
				return;
			}

			const command = ffmpeg().input(backgroundVideo.filePath);

			// 添加旁白音频
			const narrationAudio = this.getAssetBySlot(assets, inputAssets, 'narration_audio');
			if (narrationAudio) {
				command.input(narrationAudio.filePath);
			}

			// 添加背景音乐
			const bgmAudio = this.getAssetBySlot(assets, inputAssets, 'bgm_audio');
			if (bgmAudio) {
				command.input(bgmAudio.filePath);
			}

			// 构建音频混合过滤器
			const audioMixConfig = template.templateConfig?.audioMix;
			if (narrationAudio && bgmAudio && audioMixConfig) {
				const audioFilter = `[1:a]volume=${audioMixConfig.narrationVolume}[narration];[2:a]volume=${audioMixConfig.bgmVolume}[bgm];[narration][bgm]amix=inputs=2:duration=first:dropout_transition=2[aout]`;
				command.complexFilter([audioFilter]);
				command.outputOptions(['-map 0:v', '-map [aout]']);
			} else if (narrationAudio) {
				command.outputOptions(['-map 0:v', '-map 1:a']);
			} else if (bgmAudio) {
				command.outputOptions(['-map 0:v', '-map 1:a']);
			}

			command
				.outputOptions(['-c:v libx264', '-c:a aac', '-b:a 192k'])
				.size(template.videoSettings?.resolution || '1080x1920')
				.fps(template.videoSettings?.fps || 30)
				.output(outputPath)
				.on('start', commandLine => {
					this.logger.log(`FFmpeg command: ${commandLine}`);
				})
				.on('progress', progress => {
					this.logger.log(`Processing: ${progress.percent}% done`);
				})
				.on('end', () => {
					this.logger.log('Dynamic background video generation completed');
					resolve(outputPath);
				})
				.on('error', error => {
					this.logger.error('Dynamic background video generation failed:', error.message);
					reject(error);
				})
				.run();
		});
	}

	/**
	 * 生成默认视频
	 */
	private async generateDefaultVideo(
		template: ContentTemplate,
		assets: Map<string, Asset>,
		inputAssets: Array<{assetId: string; slotName: string; parameters?: Record<string, any>}>,
		outputPath: string,
	): Promise<string> {
		// 基础的视频合成逻辑
		return this.generateASMRVideo(template, assets, inputAssets, outputPath);
	}

	/**
	 * 加载任务所需的素材
	 */
	private async loadJobAssets(job: ContentJob): Promise<Map<string, Asset>> {
		const assetIds = job.inputAssets.map(asset => asset.assetId);
		const assets = await this.assetRepository.find({id: {$in: assetIds}});

		const assetMap = new Map<string, Asset>();
		for (const asset of assets) {
			assetMap.set(asset.id, asset);
		}

		return assetMap;
	}

	/**
	 * 根据插槽名称获取素材
	 */
	private getAssetBySlot(
		assets: Map<string, Asset>,
		inputAssets: Array<{assetId: string; slotName: string; parameters?: Record<string, any>}>,
		slotName: string,
	): Asset | undefined {
		const assetMapping = inputAssets.find(mapping => mapping.slotName === slotName);
		if (!assetMapping) {
			return undefined;
		}

		return assets.get(assetMapping.assetId);
	}

	/**
	 * 构建文本过滤器
	 */
	private buildTextFilter(text: string, textStyle: any): string {
		const fontSize = textStyle.fontSize || 24;
		const color = textStyle.color || '#FFFFFF';
		const fontFamily = textStyle.fontFamily || 'Arial';

		return `drawtext=text='${text}':fontsize=${fontSize}:fontcolor=${color}:x=(w-text_w)/2:y=h-text_h-50`;
	}

	/**
	 * 读取文本文件内容
	 */
	private async readTextFromFile(filePath: string): Promise<string | undefined> {
		try {
			const content = await fs.readFile(filePath, 'utf8');
			return content.trim();
		} catch (error) {
			this.logger.warn(`Failed to read text file ${filePath}:`, error instanceof Error ? error.message : String(error));
			return undefined;
		}
	}

	/**
	 * 组合音频轨道
	 */
	async combineAudioTracks(audioFiles: string[], outputPath: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const command = ffmpeg();

			// 添加所有音频输入
			for (const audioFile of audioFiles) {
				command.input(audioFile);
			}

			// 构建音频混合过滤器
			const filterInputs = audioFiles.map((_, index) => `[${index}:a]`).join('');
			const audioFilter = `${filterInputs}amix=inputs=${audioFiles.length}:duration=first[aout]`;

			command
				.complexFilter([audioFilter])
				.outputOptions(['-map [aout]', '-c:a aac', '-b:a 192k'])
				.output(outputPath)
				.on('end', () => {
					this.logger.log('Audio combination completed');
					resolve(outputPath);
				})
				.on('error', error => {
					this.logger.error('Audio combination failed:', error.message);
					reject(error);
				})
				.run();
		});
	}
}
