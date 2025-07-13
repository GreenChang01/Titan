import {spawn} from 'node:child_process';
import {promises as fs} from 'node:fs';
import {join} from 'node:path';
import {Buffer} from 'node:buffer';
import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {v4 as uuidv4} from 'uuid';
import {FfprobeData} from 'fluent-ffmpeg';
import {
	IAudioMixer,
	MixingOptions,
	BinauralSettings,
	AudioProcessingResult,
	AudioQualityReport,
	AudioQualityStandards,
} from '../interfaces';

@Injectable()
export class FfmpegAudioMixer implements IAudioMixer, OnModuleInit {
	private readonly logger = new Logger(FfmpegAudioMixer.name);
	private readonly tempDir: string;
	private readonly ffmpegPath: string;
	private readonly ffprobePath: string;

	constructor(private readonly configService: ConfigService) {
		this.tempDir = this.configService.get<string>('AUDIO_TEMP_DIR', '/tmp/titan/audio');
		this.ffmpegPath = this.configService.get<string>('FFMPEG_PATH', 'ffmpeg');
		this.ffprobePath = this.configService.get<string>('FFPROBE_PATH', 'ffprobe');
	}

	async onModuleInit() {
		this.logger.log('Initializing FfmpegAudioMixer and ensuring temp directory...');
		await this.ensureTempDirectory();
	}

	async mixVoiceAndSoundscape(
		voice: Buffer,
		soundscape: Buffer,
		options: MixingOptions,
	): Promise<AudioProcessingResult> {
		const startTime = Date.now();
		const sessionId = uuidv4();

		try {
			this.logger.log(`Starting audio mixing session: ${sessionId}`);

			// 创建临时文件
			const voiceFile = join(this.tempDir, `voice_${sessionId}.wav`);
			const soundscapeFile = join(this.tempDir, `soundscape_${sessionId}.wav`);
			const outputFile = join(this.tempDir, `mixed_${sessionId}.wav`);

			// 保存输入文件
			await fs.writeFile(voiceFile, voice);
			await fs.writeFile(soundscapeFile, soundscape);

			// 构建FFmpeg命令
			const filterComplex = this.buildMixingFilterComplex(options);
			const command = [
				'-i',
				voiceFile,
				'-i',
				soundscapeFile,
				'-filter_complex',
				filterComplex,
				'-map',
				'[final]',
				'-c:a',
				'pcm_s16le',
				'-ar',
				'44100',
				'-ac',
				'2',
				outputFile,
				'-y',
			];

			// 执行FFmpeg
			await this.executeFFmpeg(command, `Audio mixing for session ${sessionId}`);

			// 读取输出文件
			const outputBuffer = await fs.readFile(outputFile);

			// 分析音频质量
			const qualityReport = await this.analyzeAudioQuality(outputBuffer);

			// 清理临时文件
			await this.cleanupFiles([voiceFile, soundscapeFile, outputFile]);

			const processingTime = Date.now() - startTime;
			this.logger.log(`Audio mixing completed in ${processingTime}ms`);

			return {
				outputBuffer,
				metadata: {
					duration: await this.getAudioDuration(outputBuffer),
					sampleRate: 44_100,
					channels: 2,
					format: 'wav',
					size: outputBuffer.length,
					processingTime,
				},
				qualityReport,
			};
		} catch (error) {
			this.logger.error(`Audio mixing failed for session ${sessionId}: ${(error as Error).message}`);
			throw error;
		}
	}

	async applyBinauralEffects(audio: Buffer, settings: BinauralSettings): Promise<Buffer> {
		if (!settings.enabled) {
			return audio;
		}

		const sessionId = uuidv4();

		try {
			this.logger.log(`Applying binaural effects: ${sessionId}`);

			const inputFile = join(this.tempDir, `input_${sessionId}.wav`);
			const outputFile = join(this.tempDir, `binaural_${sessionId}.wav`);

			await fs.writeFile(inputFile, audio);

			const filterComplex = this.buildBinauralFilterComplex(settings);
			const command = [
				'-i',
				inputFile,
				'-filter_complex',
				filterComplex,
				'-map',
				'[binaural]',
				'-c:a',
				'pcm_s16le',
				'-ar',
				'44100',
				outputFile,
				'-y',
			];

			await this.executeFFmpeg(command, `Binaural processing for ${sessionId}`);

			const result = await fs.readFile(outputFile);
			await this.cleanupFiles([inputFile, outputFile]);

			this.logger.log('Binaural effects applied successfully');
			return result;
		} catch (error) {
			this.logger.error(`Binaural processing failed: ${(error as Error).message}`);
			throw error;
		}
	}

	async optimizeForAsmr(audio: Buffer): Promise<Buffer> {
		const sessionId = uuidv4();

		try {
			this.logger.log(`Optimizing audio for ASMR: ${sessionId}`);

			const inputFile = join(this.tempDir, `input_${sessionId}.wav`);
			const outputFile = join(this.tempDir, `asmr_${sessionId}.wav`);

			await fs.writeFile(inputFile, audio);

			// ASMR优化滤镜链
			const asmrFilters = [
				// 高通滤波器移除低频噪音
				'highpass=f=80',
				// 低通滤波器柔化高频
				'lowpass=f=15000',
				// 动态范围压缩
				'dynaudnorm=p=0.95:m=10:s=12',
				// 轻微的混响增加空间感
				'aecho=0.8:0.9:20:0.1',
				// 最终音量标准化
				'loudnorm=I=-23:TP=-2:LRA=7',
			].join(',');

			const command = ['-i', inputFile, '-af', asmrFilters, '-c:a', 'pcm_s16le', '-ar', '44100', outputFile, '-y'];

			await this.executeFFmpeg(command, `ASMR optimization for ${sessionId}`);

			const result = await fs.readFile(outputFile);
			await this.cleanupFiles([inputFile, outputFile]);

			this.logger.log('ASMR optimization completed');
			return result;
		} catch (error) {
			this.logger.error(`ASMR optimization failed: ${(error as Error).message}`);
			throw error;
		}
	}

	async analyzeAudioQuality(audio: Buffer): Promise<AudioQualityReport> {
		const sessionId = uuidv4();

		try {
			const inputFile = join(this.tempDir, `analyze_${sessionId}.wav`);
			await fs.writeFile(inputFile, audio);

			// 使用ffprobe分析音频
			const metadata = await this.getDetailedAudioInfo(inputFile);

			// 基于分析结果生成质量报告
			const report = this.generateQualityReport(metadata);

			await this.cleanupFiles([inputFile]);

			return report;
		} catch (error) {
			this.logger.error(`Audio quality analysis failed: ${(error as Error).message}`);

			// 返回默认报告
			return this.getDefaultQualityReport();
		}
	}

	async normalizeAudio(audio: Buffer, targetLUFS = -23): Promise<Buffer> {
		const sessionId = uuidv4();

		try {
			const inputFile = join(this.tempDir, `input_${sessionId}.wav`);
			const outputFile = join(this.tempDir, `normalized_${sessionId}.wav`);

			await fs.writeFile(inputFile, audio);

			const command = [
				'-i',
				inputFile,
				'-af',
				`loudnorm=I=${targetLUFS}:TP=-2:LRA=7`,
				'-c:a',
				'pcm_s16le',
				outputFile,
				'-y',
			];

			await this.executeFFmpeg(command, 'Audio normalization');

			const result = await fs.readFile(outputFile);
			await this.cleanupFiles([inputFile, outputFile]);

			return result;
		} catch (error) {
			this.logger.error(`Audio normalization failed: ${(error as Error).message}`);
			throw error;
		}
	}

	async convertFormat(
		audio: Buffer,
		targetFormat: 'mp3' | 'wav' | 'aac',
		quality: 'standard' | 'high' | 'premium' = 'high',
	): Promise<Buffer> {
		const sessionId = uuidv4();

		try {
			const inputFile = join(this.tempDir, `input_${sessionId}.wav`);
			const outputFile = join(this.tempDir, `output_${sessionId}.${targetFormat}`);

			await fs.writeFile(inputFile, audio);

			const command = this.buildFormatConversionCommand(inputFile, outputFile, targetFormat, quality);

			await this.executeFFmpeg(command, `Format conversion to ${targetFormat}`);

			const result = await fs.readFile(outputFile);
			await this.cleanupFiles([inputFile, outputFile]);

			return result;
		} catch (error) {
			this.logger.error(`Format conversion failed: ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * 构建混音滤镜复合
	 */
	private buildMixingFilterComplex(options: MixingOptions): string {
		const filters = [];

		// 音量调整
		filters.push(
			`[0:a]volume=${options.voiceVolume}[voice]`,
			`[1:a]volume=${options.soundscapeVolume}[bg]`,
			'[voice][bg]amix=inputs=2:duration=shortest:dropout_transition=3[mixed]',
		);

		// 淡入淡出
		let finalFilter = '[mixed]';
		if (options.fadeInDuration > 0) {
			filters.push(`${finalFilter}afade=t=in:ss=0:d=${options.fadeInDuration}:curve=exp[fadein]`);
			finalFilter = '[fadein]';
		}

		if (options.fadeOutDuration > 0) {
			filters.push(
				`${finalFilter}afade=t=out:st=end-${options.fadeOutDuration}:d=${options.fadeOutDuration}:curve=exp[fadeout]`,
			);
			finalFilter = '[fadeout]';
		}

		// EQ设置
		if (options.eqSettings) {
			const eq = options.eqSettings;
			const eqFilter =
				`equalizer=f=100:width_type=o:width=2:g=${eq.lowFreq}:` +
				`equalizer=f=1000:width_type=o:width=2:g=${eq.midFreq}:` +
				`equalizer=f=10000:width_type=o:width=2:g=${eq.highFreq}`;
			filters.push(`${finalFilter}${eqFilter}[eqed]`);
			finalFilter = '[eqed]';
		}

		// 压缩
		if (options.compressionRatio && options.compressionRatio > 1) {
			filters.push(`${finalFilter}dynaudnorm=p=0.95:m=10:s=12[compressed]`);
			finalFilter = '[compressed]';
		}

		filters.push(`${finalFilter}anull[final]`);

		return filters.join(';');
	}

	/**
	 * 构建双耳处理滤镜
	 */
	private buildBinauralFilterComplex(settings: BinauralSettings): string {
		const filters = [];

		// 立体声宽度调整
		if (settings.spatialWidth === 1) {
			filters.push('[0:a]anull[stereo]');
		} else {
			filters.push(`[0:a]stereotools=mlev=0.8:mwid=${settings.spatialWidth}[stereo]`);
		}

		// 延迟效果
		if (settings.leftDelay > 0 || settings.rightDelay > 0) {
			filters.push(
				`[stereo]aecho=0.8:0.9:${settings.rightDelay}|${settings.leftDelay}:${settings.reverbAmount}|${settings.reverbAmount}[delayed]`,
			);
		} else {
			filters.push('[stereo]anull[delayed]');
		}

		filters.push('[delayed]anull[binaural]');

		return filters.join(';');
	}

	/**
	 * 构建格式转换命令
	 */
	private buildFormatConversionCommand(
		inputFile: string,
		outputFile: string,
		format: string,
		quality: string,
	): string[] {
		const baseCommand = ['-i', inputFile];

		switch (format) {
			case 'mp3': {
				const mp3Quality: Record<string, string> = {
					standard: '192k',
					high: '256k',
					premium: '320k',
				};
				return [
					...baseCommand,
					'-c:a',
					'libmp3lame',
					'-b:a',
					mp3Quality[quality] || mp3Quality.standard,
					outputFile,
					'-y',
				];
			}

			case 'aac': {
				const aacQuality: Record<string, string> = {
					standard: '128k',
					high: '192k',
					premium: '256k',
				};
				return [...baseCommand, '-c:a', 'aac', '-b:a', aacQuality[quality] || aacQuality.standard, outputFile, '-y'];
			}

			case 'wav':
			default: {
				return [...baseCommand, '-c:a', 'pcm_s16le', '-ar', '44100', outputFile, '-y'];
			}
		}
	}

	/**
	 * 执行FFmpeg命令
	 */
	private async executeFFmpeg(arguments_: string[], description: string): Promise<void> {
		return new Promise((resolve, reject) => {
			this.logger.debug(`Executing FFmpeg: ${this.ffmpegPath} ${arguments_.join(' ')}`);

			const process = spawn(this.ffmpegPath, arguments_, {
				stdio: ['pipe', 'pipe', 'pipe'],
			});

			let stderr = '';

			process.stderr.on('data', (data) => {
				stderr += data.toString();
			});

			process.on('close', (code) => {
				if (code === 0) {
					this.logger.debug(`${description} completed successfully`);
					resolve();
				} else {
					this.logger.error(`${description} failed with code ${code}`);
					this.logger.error(`FFmpeg stderr: ${stderr}`);
					reject(new Error(`FFmpeg process failed with code ${code}`));
				}
			});

			process.on('error', (error) => {
				this.logger.error(`Failed to start FFmpeg: ${error.message}`);
				reject(error);
			});
		});
	}

	/**
	 * 获取详细音频信息
	 */
	private async getDetailedAudioInfo(filePath: string): Promise<FfprobeData> {
		return new Promise((resolve, reject) => {
			const arguments_ = ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath];

			const process = spawn(this.ffprobePath, arguments_, {
				stdio: ['pipe', 'pipe', 'pipe'],
			});

			let stdout = '';
			let stderr = '';

			process.stdout.on('data', (data) => {
				stdout += data.toString();
			});

			process.stderr.on('data', (data) => {
				stderr += data.toString();
			});

			process.on('close', (code) => {
				if (code === 0) {
					try {
						resolve(JSON.parse(stdout));
					} catch (error) {
						reject(new Error(`Failed to parse ffprobe output: ${(error as Error).message}`));
					}
				} else {
					reject(new Error(`ffprobe failed: ${stderr}`));
				}
			});
		});
	}

	/**
	 * 生成质量报告
	 */
	private generateQualityReport(metadata: FfprobeData): AudioQualityReport {
		const audioStream = metadata.streams.find((s: any) => s.codec_type === 'audio');
		const {format} = metadata;

		if (!audioStream?.sample_rate || !format.bit_rate || !format.duration) {
			throw new Error('Invalid audio metadata: missing required fields');
		}

		const sampleRate = audioStream.sample_rate;
		const bitRate = format.bit_rate;
		const {duration} = format;

		// 基于标准评估质量
		const standards = AudioQualityStandards.ASMR_RECOMMENDED;

		const technicalScore = this.calculateTechnicalScore(sampleRate, bitRate, audioStream);
		const asmrScore = this.calculateASMRScore(sampleRate, bitRate);

		return {
			overallScore: (technicalScore + asmrScore) / 2,
			technicalMetrics: {
				sampleRate,
				bitRate,
				dynamicRange: 16, // 需要更复杂的分析
				noiseFloor: -60, // 需要频谱分析
				frequencyResponse: {
					peakFrequency: 1000,
					averageFrequency: 800,
					dynamicRange: 16,
					spectralCentroid: 1200,
				},
			},
			asmrMetrics: {
				voiceClarity: asmrScore > 7 ? 8 : 6,
				soundscapeHarmony: 7,
				binauralEffectiveness: 6,
				relaxationPotential: asmrScore > 6 ? 8 : 5,
			},
			recommendations: this.generateRecommendations(sampleRate, bitRate, technicalScore),
			needsReprocessing: technicalScore < 6,
		};
	}

	private calculateTechnicalScore(sampleRate: number, bitRate: number, stream: any): number {
		let score = 5; // 基础分

		// 采样率评分
		if (sampleRate >= 48_000) {
			score += 2;
		} else if (sampleRate >= 44_100) {
			score += 1;
		}

		// 比特率评分
		if (bitRate >= 320_000) {
			score += 2;
		} else if (bitRate >= 256_000) {
			score += 1.5;
		} else if (bitRate >= 192_000) {
			score += 1;
		}

		// 声道评分
		if (stream.channels >= 2) {
			score += 1;
		}

		return Math.min(10, score);
	}

	private calculateASMRScore(sampleRate: number, bitRate: number): number {
		let score = 5;

		// ASMR特定评分标准
		if (sampleRate >= 44_100 && bitRate >= 256_000) {
			score += 3;
		} else if (sampleRate >= 44_100 && bitRate >= 192_000) {
			score += 2;
		}

		return Math.min(10, score);
	}

	private generateRecommendations(sampleRate: number, bitRate: number, score: number): string[] {
		const recommendations = [];

		if (sampleRate < 44_100) {
			recommendations.push('建议使用44.1kHz或更高的采样率');
		}

		if (bitRate < 256_000) {
			recommendations.push('建议使用256kbps或更高的比特率以确保ASMR质量');
		}

		if (score < 6) {
			recommendations.push('音频质量需要改善，建议重新处理');
		}

		if (score < 8) {
			recommendations.push('应用ASMR优化滤镜可能有助于提升质量');
		}

		return recommendations;
	}

	private getDefaultQualityReport(): AudioQualityReport {
		return {
			overallScore: 5,
			technicalMetrics: {
				sampleRate: 44_100,
				bitRate: 256_000,
				dynamicRange: 16,
				noiseFloor: -60,
				frequencyResponse: {
					peakFrequency: 1000,
					averageFrequency: 800,
					dynamicRange: 16,
					spectralCentroid: 1200,
				},
			},
			asmrMetrics: {
				voiceClarity: 5,
				soundscapeHarmony: 5,
				binauralEffectiveness: 5,
				relaxationPotential: 5,
			},
			recommendations: ['无法完成详细分析，使用默认质量评估'],
			needsReprocessing: false,
		};
	}

	private async getAudioDuration(audioBuffer: Buffer): Promise<number> {
		// 简化的时长计算，实际应使用ffprobe
		return Math.floor(audioBuffer.length / (44_100 * 2 * 2)); // 44.1kHz, 16-bit, stereo
	}

	private async ensureTempDirectory(): Promise<void> {
		try {
			await fs.mkdir(this.tempDir, {recursive: true});
		} catch (error) {
			this.logger.error(`Failed to create temp directory: ${(error as Error).message}`);
		}
	}

	private async cleanupFiles(files: string[]): Promise<void> {
		for (const file of files) {
			try {
				await fs.unlink(file);
			} catch (error) {
				this.logger.warn(`Failed to cleanup file ${file}: ${(error as Error).message}`);
			}
		}
	}
}
