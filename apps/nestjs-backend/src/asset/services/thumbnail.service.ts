import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from '../../config/config-key.enum';
import * as path from 'path';
import * as fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';

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

  async generateThumbnail(filePath: string, mimeType: string): Promise<string> {
    try {
      const thumbnailDir = path.join(this.uploadDir, 'thumbnails');
      await fs.ensureDir(thumbnailDir);

      const fileExtension = path.extname(filePath);
      const baseName = path.basename(filePath, fileExtension);
      const thumbnailPath = path.join(thumbnailDir, `${baseName}_thumb.jpg`);

      if (mimeType.startsWith('image/')) {
        await this.generateImageThumbnail(filePath, thumbnailPath);
      } else if (mimeType.startsWith('video/')) {
        await this.generateVideoThumbnail(filePath, thumbnailPath);
      } else {
        // For other file types, return a default placeholder or null
        return null;
      }

      return thumbnailPath;
    } catch (error) {
      this.logger.error(`Failed to generate thumbnail for ${filePath}:`, error);
      return null;
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

  async generateMultipleThumbnails(filePath: string, mimeType: string): Promise<{ small: string; large: string }> {
    try {
      const thumbnailDir = path.join(this.uploadDir, 'thumbnails');
      await fs.ensureDir(thumbnailDir);

      const fileExtension = path.extname(filePath);
      const baseName = path.basename(filePath, fileExtension);
      const smallThumbPath = path.join(thumbnailDir, `${baseName}_thumb_200.jpg`);
      const largeThumbPath = path.join(thumbnailDir, `${baseName}_thumb_800.jpg`);

      if (mimeType.startsWith('image/')) {
        await this.generateImageThumbnailWithSize(filePath, smallThumbPath, '200x200');
        await this.generateImageThumbnailWithSize(filePath, largeThumbPath, '800x600');
      } else if (mimeType.startsWith('video/')) {
        await this.generateVideoThumbnailWithSize(filePath, smallThumbPath, '200x200');
        await this.generateVideoThumbnailWithSize(filePath, largeThumbPath, '800x600');
      } else {
        return { small: null, large: null };
      }

      return { small: smallThumbPath, large: largeThumbPath };
    } catch (error) {
      this.logger.error(`Failed to generate multiple thumbnails for ${filePath}:`, error);
      return { small: null, large: null };
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