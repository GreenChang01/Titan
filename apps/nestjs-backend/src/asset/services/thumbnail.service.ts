import * as path from 'node:path';
import {promises as fs} from 'node:fs';
import {exec} from 'node:child_process';
import {promisify} from 'node:util';
import {ConfigService} from '@nestjs/config';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigKey} from '../../config/config-key.enum';

const execAsync = promisify(exec);

@Injectable()
export class ThumbnailService {
	private readonly logger = new Logger(ThumbnailService.name);
	private readonly uploadDir: string;
	private readonly ffmpegPath: string;

	constructor(private readonly configService: ConfigService) {
		this.uploadDir = this.configService.get<string>(ConfigKey.UPLOAD_DIR) || './uploads';
		this.ffmpegPath = this.configService.get<string>(ConfigKey.FFMPEG_PATH) || '/usr/bin/ffmpeg';
	}

	async generateThumbnail(filePath: string): Promise<string | undefined> {
		try {
			const thumbnailDir = path.join(this.uploadDir, 'thumbnails');
			await fs.mkdir(thumbnailDir, {recursive: true});

			const fileExtension = path.extname(filePath).toLowerCase();
			const baseName = path.basename(filePath, fileExtension);
			const thumbnailPath = path.join(thumbnailDir, `${baseName}_thumb.jpg`);

			// Detect MIME type from file extension
			const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(fileExtension);
			const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'].includes(fileExtension);

			if (isImage) {
				await this.generateImageThumbnail(filePath, thumbnailPath);
			} else if (isVideo) {
				await this.generateVideoThumbnail(filePath, thumbnailPath);
			} else {
				// For other file types, return undefined
				return undefined;
			}

			return thumbnailPath;
		} catch (error) {
			this.logger.error(`Failed to generate thumbnail for ${filePath}:`, error);
			return undefined;
		}
	}

	private async generateImageThumbnail(inputPath: string, outputPath: string): Promise<void> {
		// Using Sharp library would be better, but using ffmpeg for consistency
		const command = `${this.ffmpegPath} -i "${inputPath}" -vf "scale=200:200:force_original_aspect_ratio=decrease,pad=200:200:(ow-iw)/2:(oh-ih)/2" -y "${outputPath}"`;

		await execAsync(command);
		this.logger.log(`Generated image thumbnail: ${outputPath}`);
	}

	private async generateVideoThumbnail(inputPath: string, outputPath: string): Promise<void> {
		// Extract frame at 1 second or 10% of video duration
		const command = `${this.ffmpegPath} -i "${inputPath}" -ss 00:00:01 -vframes 1 -vf "scale=200:200:force_original_aspect_ratio=decrease,pad=200:200:(ow-iw)/2:(oh-ih)/2" -y "${outputPath}"`;

		await execAsync(command);
		this.logger.log(`Generated video thumbnail: ${outputPath}`);
	}

	async generateMultipleThumbnails(filePath: string): Promise<{small: string | undefined; large: string | undefined}> {
		try {
			const thumbnailDir = path.join(this.uploadDir, 'thumbnails');
			await fs.mkdir(thumbnailDir, {recursive: true});

			const fileExtension = path.extname(filePath).toLowerCase();
			const baseName = path.basename(filePath, fileExtension);
			const smallThumbPath = path.join(thumbnailDir, `${baseName}_thumb_200.jpg`);
			const largeThumbPath = path.join(thumbnailDir, `${baseName}_thumb_800.jpg`);

			// Detect MIME type from file extension
			const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(fileExtension);
			const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'].includes(fileExtension);

			if (isImage) {
				await this.generateImageThumbnailWithSize(filePath, smallThumbPath, '200x200');
				await this.generateImageThumbnailWithSize(filePath, largeThumbPath, '800x600');
			} else if (isVideo) {
				await this.generateVideoThumbnailWithSize(filePath, smallThumbPath, '200x200');
				await this.generateVideoThumbnailWithSize(filePath, largeThumbPath, '800x600');
			} else {
				return {small: undefined, large: undefined};
			}

			return {small: smallThumbPath, large: largeThumbPath};
		} catch (error) {
			this.logger.error(`Failed to generate multiple thumbnails for ${filePath}:`, error);
			return {small: undefined, large: undefined};
		}
	}

	private async generateImageThumbnailWithSize(inputPath: string, outputPath: string, size: string): Promise<void> {
		const command = `${this.ffmpegPath} -i "${inputPath}" -vf "scale=${size}:force_original_aspect_ratio=decrease,pad=${size}:(ow-iw)/2:(oh-ih)/2" -y "${outputPath}"`;
		await execAsync(command);
	}

	private async generateVideoThumbnailWithSize(inputPath: string, outputPath: string, size: string): Promise<void> {
		const command = `${this.ffmpegPath} -i "${inputPath}" -ss 00:00:01 -vframes 1 -vf "scale=${size}:force_original_aspect_ratio=decrease,pad=${size}:(ow-iw)/2:(oh-ih)/2" -y "${outputPath}"`;
		await execAsync(command);
	}
}
