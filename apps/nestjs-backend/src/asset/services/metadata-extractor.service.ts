import {exec} from 'node:child_process';
import {promisify} from 'node:util';
import {promises as fs} from 'node:fs';
import * as path from 'node:path';
import {ConfigService} from '@nestjs/config';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigKey} from '../../config/config-key.enum';

const execAsync = promisify(exec);

type MediaMetadata = {
	duration?: number;
	width?: number;
	height?: number;
	bitrate?: number;
	fps?: number;
	codec?: string;
	channels?: number;
	sampleRate?: number;
	format?: string;
	[key: string]: any;
};

@Injectable()
export class MetadataExtractorService {
	private readonly logger = new Logger(MetadataExtractorService.name);
	private readonly ffprobePath: string;

	constructor(private readonly configService: ConfigService) {
		const ffmpegPath = this.configService.get<string>(ConfigKey.FFMPEG_PATH) || '/usr/bin/ffmpeg';
		this.ffprobePath = ffmpegPath.replace('ffmpeg', 'ffprobe');
	}

	async extractMetadata(filePath: string): Promise<MediaMetadata> {
		try {
			// Detect MIME type from file extension
			const fileExtension = path.extname(filePath).toLowerCase();
			const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'].includes(fileExtension);
			const isAudio = ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a'].includes(fileExtension);
			const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(fileExtension);
			const isText = ['.txt', '.md', '.rtf', '.doc', '.docx'].includes(fileExtension);

			if (isVideo || isAudio) {
				return await this.extractMediaMetadata(filePath);
			}

			if (isImage) {
				return await this.extractImageMetadata(filePath);
			}

			if (isText) {
				return await this.extractTextMetadata(filePath);
			}

			return {};
		} catch (error) {
			this.logger.error(`Failed to extract metadata for ${filePath}:`, error);
			return {};
		}
	}

	private async extractMediaMetadata(filePath: string): Promise<MediaMetadata> {
		const command = `${this.ffprobePath} -v quiet -print_format json -show_format -show_streams "${filePath}"`;

		const {stdout} = await execAsync(command);
		const probe = JSON.parse(stdout);

		const metadata: MediaMetadata = {};

		// Extract format information
		if (probe.format) {
			metadata.duration = Number.parseFloat(probe.format.duration) || 0;
			metadata.bitrate = Number.parseInt(probe.format.bit_rate) || 0;
			metadata.format = probe.format.format_name;
		}

		// Extract video stream information
		const videoStream = probe.streams?.find((stream: any) => stream.codec_type === 'video');
		if (videoStream) {
			metadata.width = videoStream.width;
			metadata.height = videoStream.height;
			metadata.codec = videoStream.codec_name;

			// Calculate FPS
			if (videoStream.r_frame_rate) {
				const [number_, den] = videoStream.r_frame_rate.split('/').map(Number);
				metadata.fps = den ? Math.round((number_ / den) * 100) / 100 : 0;
			}
		}

		// Extract audio stream information
		const audioStream = probe.streams?.find((stream: any) => stream.codec_type === 'audio');
		if (audioStream) {
			metadata.channels = audioStream.channels;
			metadata.sampleRate = audioStream.sample_rate;
			metadata.codec ||= audioStream.codec_name;
		}

		return metadata;
	}

	private async extractImageMetadata(filePath: string): Promise<MediaMetadata> {
		const command = `${this.ffprobePath} -v quiet -print_format json -show_streams "${filePath}"`;

		try {
			const {stdout} = await execAsync(command);
			const probe = JSON.parse(stdout);

			const videoStream = probe.streams?.[0];
			if (videoStream) {
				return {
					width: videoStream.width,
					height: videoStream.height,
					codec: videoStream.codec_name,
					format: videoStream.codec_name,
				};
			}
		} catch {
			this.logger.warn(`FFprobe failed for image ${filePath}, using basic metadata`);
		}

		// Fallback to basic file stats
		const stats = await fs.stat(filePath);
		return {
			fileSize: stats.size,
			lastModified: stats.mtime,
		};
	}

	private async extractTextMetadata(filePath: string): Promise<MediaMetadata> {
		const stats = await fs.stat(filePath);
		const content = await fs.readFile(filePath, 'utf8');

		return {
			fileSize: stats.size,
			lastModified: stats.mtime,
			lineCount: content.split('\n').length,
			characterCount: content.length,
			wordCount: content.split(/\s+/).filter((word: string) => word.length > 0).length,
		};
	}

	async getVideoDuration(filePath: string): Promise<number> {
		try {
			const command = `${this.ffprobePath} -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`;
			const {stdout} = await execAsync(command);
			return Number.parseFloat(stdout.trim()) || 0;
		} catch (error) {
			this.logger.error(`Failed to get video duration for ${filePath}:`, error);
			return 0;
		}
	}

	async getVideoResolution(filePath: string): Promise<{width: number; height: number}> {
		try {
			const command = `${this.ffprobePath} -v quiet -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${filePath}"`;
			const {stdout} = await execAsync(command);
			const [width, height] = stdout.trim().split('x').map(Number);
			return {width: width || 0, height: height || 0};
		} catch (error) {
			this.logger.error(`Failed to get video resolution for ${filePath}:`, error);
			return {width: 0, height: 0};
		}
	}
}
